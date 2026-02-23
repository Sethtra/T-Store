<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    /**
     * Get all orders with filters.
     */
    public function index(Request $request)
    {
        $query = Order::with('items')->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $perPage = min($request->per_page ?? $request->limit ?? 20, 50);
        $orders = $query->paginate($perPage);

        return response()->json([
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * Get a single order with full details.
     */
    public function show(string $id)
    {
        // Try to find by tracking_id first, then by id
        $order = Order::with(['items.product', 'user'])
            ->where('tracking_id', $id)
            ->orWhere('id', $id)
            ->firstOrFail();

        return response()->json([
            'id' => $order->id,
            'tracking_id' => $order->tracking_id,
            'status' => $order->status,
            'total' => $order->total,
            'payment_method' => $order->payment_method,
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
            // Shipping Info
            'shipping_name' => $order->shipping_name ?? $order->user->name,
            'shipping_email' => $order->shipping_email ?? $order->user->email,
            'shipping_phone' => $order->shipping_phone,
            'shipping_address' => $order->shipping_address,
            'shipping_city' => $order->shipping_city,
            'shipping_country' => $order->shipping_country,
            'shipping_postal_code' => $order->shipping_postal_code,
            'notes' => $order->notes,
            // Buyer Info
            'user' => [
                'id' => $order->user->id,
                'name' => $order->user->name,
                'email' => $order->user->email,
            ],
            // Order Items
            'items' => $order->items->map(fn($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product?->title ?? 'Unknown Product',
                'product_image' => $item->product?->images[0] ?? null,
                'quantity' => $item->quantity,
                'price' => $item->price,
                'attributes' => $item->attributes,
                'subtotal' => $item->quantity * $item->price,
            ]),
        ]);
    }

    /**
     * Update order status.
     */
    public function updateStatus(Request $request, int $id)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,completed,cancelled',
        ]);

        $order = Order::with('items')->findOrFail($id);
        $oldStatus = $order->status;

        // Restore stock when order is cancelled (only if it wasn't already cancelled)
        if ($request->status === 'cancelled' && $oldStatus !== 'cancelled') {
            foreach ($order->items as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    $product->increment('stock', $item->quantity);
                }
            }
        }

        $order->update([
            'status' => $request->status,
        ]);

        return response()->json([
            'message' => "Order status updated from {$oldStatus} to {$request->status}",
            'order' => $order->fresh()->load('items'),
        ]);
    }
}
