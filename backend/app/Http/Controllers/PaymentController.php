<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
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

        if (!$endpoint_secret) {
            Log::error('Stripe webhook secret is not configured. Rejecting webhook.');
            return response()->json(['error' => 'Webhook not configured'], 500);
        }

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
     * Hash order per official docs: req_time, merchant_id, tran_id, amount, items, shipping,
     * firstname, lastname, email, phone, type, payment_option, return_url, cancel_url,
     * continue_success_url, return_deeplink, currency, custom_fields, return_params,
     * payout, lifetime, additional_params, google_pay_token, skip_success_page
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

        // tran_id max 20 chars per ABA docs
        $tranId = substr('TS' . $order->id . time(), 0, 20);
        $reqTime = gmdate('YmdHis'); // UTC format per docs
        $amount = number_format($order->total, 2, '.', '');
        $firstName = $order->shipping_name ?? 'Customer';
        $lastName = '';
        $email = $order->shipping_email ?? '';
        $phone = $order->shipping_phone ?? '';
        $type = 'purchase';
        $paymentOption = ''; // Let PayWay show all available options
        $currency = 'USD';

        // Items (base64-encoded JSON array per docs)
        $itemsList = [];
        foreach ($order->items as $item) {
            $itemsList[] = [
                'name' => $item->product_title,
                'quantity' => $item->quantity,
                'price' => (float) $item->price,
            ];
        }
        $items = base64_encode(json_encode($itemsList));

        $shipping = '0';
        $returnUrl = config('app.frontend_url', 'http://localhost:3000') . '/orders?payment=success&order_id=' . $order->id;
        $cancelUrl = config('app.frontend_url', 'http://localhost:3000') . '/checkout';
        $continueSuccessUrl = $returnUrl;
        $returnDeeplink = '';
        $customFields = '';
        $returnParams = 'order_id=' . $order->id;
        $payout = '';
        $lifetime = '';
        $additionalParams = '';
        $googlePayToken = '';
        $skipSuccessPage = '';

        // Build hash string per official ABA PayWay docs (exact order matters!)
        $b4hash = $reqTime . $merchantId . $tranId . $amount . $items . $shipping
            . $firstName . $lastName . $email . $phone . $type . $paymentOption
            . $returnUrl . $cancelUrl . $continueSuccessUrl . $returnDeeplink
            . $currency . $customFields . $returnParams . $payout . $lifetime
            . $additionalParams . $googlePayToken . $skipSuccessPage;

        // HMAC-SHA512 hash (base64 encoded) using public key
        $hash = base64_encode(hash_hmac('sha512', $b4hash, $apiKey, true));

        // Store the PayWay transaction ID on the order
        $order->update([
            'payment_intent' => $tranId,
            'payment_method' => 'payway',
        ]);

        // Execute S2S request to PayWay to get KHQR payload directly
        $response = Http::asForm()->post($baseUrl . '/api/payment-gateway/v1/payments/purchase', [
            'hash' => $hash,
            'tran_id' => $tranId,
            'amount' => $amount,
            'items' => $items,
            'shipping' => $shipping,
            'firstname' => $firstName,
            'lastname' => $lastName,
            'email' => $email,
            'phone' => $phone,
            'type' => $type,
            'payment_option' => $paymentOption,
            'currency' => $currency,
            'merchant_id' => $merchantId,
            'req_time' => $reqTime,
            'return_url' => $returnUrl,
            'cancel_url' => $cancelUrl,
            'continue_success_url' => $continueSuccessUrl,
            'return_deeplink' => $returnDeeplink,
            'custom_fields' => $customFields,
            'return_params' => $returnParams,
        ]);

        $apiData = $response->json();

        return response()->json([
            'order_id' => $order->id,
            'payway_response' => $apiData
        ]);
    }

    /**
     * Handle ABA PayWay callback (pushback notification).
     * Verifies HMAC-SHA512 signature from X-PayWay-HMAC-SHA512 header per official docs.
     */
    public function paywayCallback(Request $request)
    {
        $response = $request->all();
        $tranId = $response['tran_id'] ?? null;
        $status = $response['status'] ?? null;

        if (!$tranId) {
            return response()->json(['error' => 'Missing transaction ID'], 400);
        }

        $order = Order::where('payment_intent', $tranId)->first();

        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        // Verify HMAC signature from header (per ABA PayWay official docs)
        $apiKey = config('services.payway.api_key');
        $receivedSignature = $request->header('X-PayWay-HMAC-SHA512', '');

        if ($apiKey && $receivedSignature) {
            // 1. Sort fields by key ascending
            ksort($response);

            // 2. Concatenate all values
            $b4hash = '';
            foreach ($response as $value) {
                if (is_array($value)) {
                    $value = json_encode($value);
                }
                $b4hash .= $value;
            }

            // 3. Generate HMAC-SHA512 signature
            $signature = base64_encode(hash_hmac('sha512', $b4hash, $apiKey, true));

            // 4. Compare signatures
            if (!hash_equals($signature, $receivedSignature)) {
                Log::warning('PayWay callback signature verification failed', [
                    'tran_id' => $tranId,
                    'status' => $status,
                ]);
                return response()->json(['error' => 'Invalid signature'], 403);
            }
        }

        // Status "0" = Approved per ABA PayWay docs
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

    public function simulatePaywayPayment(Request $request)
    {
        // Only allow simulation in debug/sandbox mode
        if (!config('app.debug') && config('services.payway.base_url') === 'https://checkout.payway.com.kh') {
            abort(403, 'Simulation is strictly restricted to Sandbox environment.');
        }

        $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        // Ensure user owns this order (prevent marking other users' orders as paid)
        $order = Order::where('id', $request->order_id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();
        
        // Mark as paid
        $order->payment_status = 'paid';
        $order->status = 'processing';
        $order->save();

        // Decrement product stock for this sandbox purchase
        foreach ($order->items as $item) {
            $product = Product::find($item->product_id);
            if ($product && !empty($item->quantity)) {
                $product->decrement('stock', $item->quantity);
                StockMovement::create([
                    'product_id' => $product->id,
                    'quantity_change' => -$item->quantity,
                    'type' => 'sale',
                    'reference' => 'Order #' . $order->tracking_id . ' (simulated)',
                ]);
            }
        }

        return response()->json(['message' => 'Simulated successfully.']);
    }
}
