<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class PaymentController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create a Stripe PaymentIntent for an order.
     */
    public function createStripeIntent(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        $order = Order::where('id', $request->order_id)
            ->where('user_id', $request->user()->id)
            ->where('payment_status', 'pending')
            ->firstOrFail();

        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => (int) round($order->total * 100), // Stripe expects cents
                'currency' => 'usd',
                'metadata' => [
                    'order_id' => $order->id,
                    'tracking_id' => $order->tracking_id,
                ],
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            // Store the payment intent ID on the order
            $order->update([
                'payment_intent' => $paymentIntent->id,
            ]);

            return response()->json([
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create payment intent: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle Stripe webhook events.
     */
    public function stripeWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');
        $endpoint_secret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sig_header, $endpoint_secret);
        } catch (\UnexpectedValueException $e) {
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (SignatureVerificationException $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        switch ($event->type) {
            case 'payment_intent.succeeded':
                $paymentIntent = $event->data->object;
                $this->handlePaymentSuccess($paymentIntent->id);
                break;

            case 'payment_intent.payment_failed':
                $paymentIntent = $event->data->object;
                $this->handlePaymentFailure($paymentIntent->id);
                break;
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Create a PayPal order.
     */
    public function createPaypalOrder(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        $order = Order::where('id', $request->order_id)
            ->where('user_id', $request->user()->id)
            ->where('payment_status', 'pending')
            ->firstOrFail();

        try {
            $accessToken = $this->getPaypalAccessToken();

            $response = Http::withToken($accessToken)
                ->post($this->getPaypalBaseUrl() . '/v2/checkout/orders', [
                    'intent' => 'CAPTURE',
                    'purchase_units' => [
                        [
                            'reference_id' => $order->tracking_id,
                            'amount' => [
                                'currency_code' => 'USD',
                                'value' => number_format($order->total, 2, '.', ''),
                            ],
                            'description' => "T-Store Order #{$order->tracking_id}",
                        ],
                    ],
                    'application_context' => [
                        'return_url' => config('app.frontend_url', 'http://localhost:5173') . '/orders?payment=success',
                        'cancel_url' => config('app.frontend_url', 'http://localhost:5173') . '/checkout?payment=cancelled',
                        'brand_name' => 'T-Store',
                        'user_action' => 'PAY_NOW',
                    ],
                ]);

            if ($response->failed()) {
                return response()->json([
                    'message' => 'Failed to create PayPal order',
                ], 500);
            }

            $paypalOrder = $response->json();

            // Store PayPal order ID on our order
            $order->update([
                'paypal_order_id' => $paypalOrder['id'],
                'payment_method' => 'paypal',
            ]);

            // Find the approval link
            $approvalUrl = collect($paypalOrder['links'])
                ->firstWhere('rel', 'approve')['href'] ?? null;

            return response()->json([
                'paypal_order_id' => $paypalOrder['id'],
                'approval_url' => $approvalUrl,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create PayPal order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Capture a PayPal order after buyer approval.
     */
    public function capturePaypalOrder(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'paypal_order_id' => 'required|string',
        ]);

        $order = Order::where('id', $request->order_id)
            ->where('user_id', $request->user()->id)
            ->where('payment_status', 'pending')
            ->firstOrFail();

        try {
            $accessToken = $this->getPaypalAccessToken();

            $response = Http::withToken($accessToken)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post($this->getPaypalBaseUrl() . "/v2/checkout/orders/{$request->paypal_order_id}/capture", []);

            if ($response->failed()) {
                return response()->json([
                    'message' => 'Failed to capture PayPal payment',
                ], 500);
            }

            $captureData = $response->json();

            if ($captureData['status'] === 'COMPLETED') {
                // Mark order as paid and decrement stock
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'processing',
                ]);

                // Decrement stock for each item
                foreach ($order->items as $item) {
                    $product = Product::find($item->product_id);
                    if ($product) {
                        $product->decrement('stock', $item->quantity);

                        // Record stock movement
                        StockMovement::create([
                            'product_id' => $product->id,
                            'quantity_change' => -$item->quantity, // Negative for reduction
                            'type' => 'sale',
                            'reference' => 'Order #' . $order->tracking_id,
                        ]);
                    }
                }

                return response()->json([
                    'message' => 'Payment captured successfully',
                    'order' => $order->fresh()->load('items'),
                ]);
            }

            return response()->json([
                'message' => 'Payment capture failed',
                'details' => $captureData,
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to capture PayPal payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle successful Stripe payment.
     */
    private function handlePaymentSuccess(string $paymentIntentId)
    {
        $order = Order::where('payment_intent', $paymentIntentId)->first();

        if ($order && $order->payment_status !== 'paid') {
            $order->update([
                'payment_status' => 'paid',
                'status' => 'processing',
            ]);

            // Decrement stock for each item
            foreach ($order->items as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    $product->decrement('stock', $item->quantity);

                    // Record stock movement
                    StockMovement::create([
                        'product_id' => $product->id,
                        'quantity_change' => -$item->quantity, // Negative for reduction
                        'type' => 'sale',
                        'reference' => 'Order #' . $order->tracking_id,
                    ]);
                }
            }
        }
    }

    /**
     * Handle failed Stripe payment.
     */
    private function handlePaymentFailure(string $paymentIntentId)
    {
        $order = Order::where('payment_intent', $paymentIntentId)->first();

        if ($order) {
            $order->update([
                'payment_status' => 'failed',
            ]);
        }
    }

    /**
     * Get PayPal access token.
     */
    private function getPaypalAccessToken(): string
    {
        $clientId = config('services.paypal.client_id');
        $clientSecret = config('services.paypal.client_secret');

        $response = Http::withBasicAuth($clientId, $clientSecret)
            ->asForm()
            ->post($this->getPaypalBaseUrl() . '/v1/oauth2/token', [
                'grant_type' => 'client_credentials',
            ]);

        return $response->json('access_token');
    }

    /**
     * Get PayPal API base URL.
     */
    private function getPaypalBaseUrl(): string
    {
        return config('services.paypal.mode', 'sandbox') === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';
    }
}
