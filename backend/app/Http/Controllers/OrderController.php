<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Get user's orders.
     */
    public function index(Request $request)
    {
        $orders = Order::with('items.product')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    /**
     * Get single order.
     */
    public function show(Request $request, int $id)
    {
        $order = Order::with('items.product')
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json($order);
    }

    /**
     * Create a new order.
     */
    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.attributes' => 'nullable|array',
            'payment_method' => 'required|in:stripe,paypal',
            'delivery_method' => 'nullable|in:delivery,pickup',
            'shipping_address' => 'nullable|array',
            'shipping_name' => 'nullable|string',
            'shipping_email' => 'nullable|email',
            'shipping_phone' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request) {
            $total = 0;
            $orderItems = [];

            // Calculate total and validate stock
            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);

                if ($product->stock < $item['quantity']) {
                    return response()->json([
                        'message' => "Insufficient stock for {$product->title}",
                    ], 400);
                }

                $itemTotal = $product->price * $item['quantity'];
                $total += $itemTotal;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_title' => $product->title,
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                    'attributes' => $item['attributes'] ?? null,
                ];

                // Decrement stock
                $product->decrement('stock', $item['quantity']);
            }

            // Handle shipping address based on delivery method
            $deliveryMethod = $request->delivery_method ?? 'pickup';
            $shippingAddress = null;
            $shippingCity = null;
            $shippingCountry = null;
            $shippingPostalCode = null;

            if ($deliveryMethod === 'delivery' && $request->shipping_address) {
                $shippingAddress = $request->shipping_address['address'] ?? null;
                $shippingCity = $request->shipping_address['city'] ?? null;
                $shippingCountry = $request->shipping_address['country'] ?? null;
                $shippingPostalCode = $request->shipping_address['postalCode'] ?? null;
            } elseif ($deliveryMethod === 'pickup') {
                $shippingAddress = 'Self Pick Up';
            }

            // Create order with shipping info
            $order = Order::create([
                'user_id' => $request->user()->id,
                'status' => 'pending',
                'total' => $total,
                'payment_method' => $request->payment_method,
                'shipping_name' => $request->shipping_name ?? $request->user()->name,
                'shipping_email' => $request->shipping_email ?? $request->user()->email,
                'shipping_phone' => $request->shipping_phone,
                'shipping_address' => $shippingAddress,
                'shipping_city' => $shippingCity,
                'shipping_country' => $shippingCountry,
                'shipping_postal_code' => $shippingPostalCode,
                'notes' => $request->notes,
            ]);

            // Create order items
            foreach ($orderItems as $item) {
                $order->items()->create($item);
            }

            // TODO: Process payment with Stripe/PayPal
            // For now, we'll just return the order

            return response()->json([
                'message' => 'Order created successfully',
                'order' => $order->load('items'),
            ], 201);
        });
    }
}
