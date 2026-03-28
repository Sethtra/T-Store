<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
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

    // ─── Stripe ───────────────────────────────────────────────

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
                'amount' => (int) round($order->total * 100),
                'currency' => 'usd',
                'metadata' => [
                    'order_id' => $order->id,
                    'tracking_id' => $order->tracking_id,
                ],
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

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

    // ─── ABA PayWay ───────────────────────────────────────────

    /**
     * Create an ABA PayWay transaction.
     * Returns the form data needed to redirect the user to PayWay checkout.
     */
    public function createPaywayTransaction(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        $order = Order::where('id', $request->order_id)
            ->where('user_id', $request->user()->id)
            ->where('payment_status', 'pending')
            ->firstOrFail();

        $merchantId = config('services.payway.merchant_id');
        $apiKey = config('services.payway.api_key');
        $baseUrl = config('services.payway.base_url', 'https://checkout-sandbox.payway.com.kh');

        if (!$merchantId || !$apiKey) {
            return response()->json([
                'message' => 'PayWay is not configured. Please contact support.',
            ], 500);
        }

        $tranId = 'TS-' . $order->tracking_id . '-' . Str::random(6);
        $amount = number_format($order->total, 2, '.', '');
        $firstName = $order->shipping_name ?? 'Customer';
        $lastName = '';
        $email = $order->shipping_email ?? '';
        $phone = $order->shipping_phone ?? '';
        $currency = 'USD';
        $returnUrl = config('app.frontend_url', 'http://localhost:3000') . '/orders?payment=success&order_id=' . $order->id;
        $continueSuccessUrl = $returnUrl;
        $returnDeeplink = '';
        $type = 'purchase';

        // Build the hash string per ABA PayWay docs
        $hashStr = $tranId . $amount . $firstName . $lastName . $email . $phone . $type . $currency . $returnUrl;

        // HMAC-SHA512 hash
        $hash = base64_encode(hash_hmac('sha512', $hashStr, $apiKey, true));

        // Store the PayWay transaction ID on the order
        $order->update([
            'payment_intent' => $tranId,
            'payment_method' => 'payway',
        ]);

        return response()->json([
            'checkout_url' => $baseUrl . '/api/payment-gateway/v1/payments/purchase',
            'form_data' => [
                'hash' => $hash,
                'tran_id' => $tranId,
                'amount' => $amount,
                'firstname' => $firstName,
                'lastname' => $lastName,
                'email' => $email,
                'phone' => $phone,
                'type' => $type,
                'payment_option' => '',
                'currency' => $currency,
                'merchant_id' => $merchantId,
                'return_url' => $returnUrl,
                'continue_success_url' => $continueSuccessUrl,
                'return_deeplink' => $returnDeeplink,
                'return_params' => 'order_id=' . $order->id,
            ],
        ]);
    }

    /**
     * Handle ABA PayWay callback (push-back notification).
     */
    public function paywayCallback(Request $request)
    {
        $tranId = $request->input('tran_id');
        $status = $request->input('status');

        if (!$tranId) {
            return response()->json(['error' => 'Missing transaction ID'], 400);
        }

        $order = Order::where('payment_intent', $tranId)->first();

        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        // Verify the hash from ABA PayWay
        $apiKey = config('services.payway.api_key');
        $hashStr = $tranId . $request->input('amount') . $status;
        $expectedHash = base64_encode(hash_hmac('sha512', $hashStr, $apiKey, true));

        // Status codes: 0 = Approved, others = various failures
        if ($status == '0') {
            if ($order->payment_status !== 'paid') {
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'processing',
                ]);

                // Decrement stock
                foreach ($order->items as $item) {
                    $product = Product::find($item->product_id);
                    if ($product) {
                        $product->decrement('stock', $item->quantity);
                        StockMovement::create([
                            'product_id' => $product->id,
                            'quantity_change' => -$item->quantity,
                            'type' => 'sale',
                            'reference' => 'Order #' . $order->tracking_id,
                        ]);
                    }
                }
            }

            return response()->json(['message' => 'Payment processed successfully']);
        }

        // Payment failed
        $order->update(['payment_status' => 'failed']);
        return response()->json(['message' => 'Payment failed', 'status' => $status]);
    }

    /**
     * Check PayWay payment status (called by frontend after redirect back).
     */
    public function paywayCheckStatus(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        $order = Order::where('id', $request->order_id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        return response()->json([
            'payment_status' => $order->payment_status,
            'status' => $order->status,
        ]);
    }

    // ─── Shared Helpers ───────────────────────────────────────

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

            foreach ($order->items as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    $product->decrement('stock', $item->quantity);
                    StockMovement::create([
                        'product_id' => $product->id,
                        'quantity_change' => -$item->quantity,
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
}
