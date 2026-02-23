<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Carbon\Carbon;

class NotificationController extends Controller
{
    /**
     * Get admin notifications for stock alerts and new orders.
     */
    public function index()
    {
        $notifications = [];

        // Out of stock products
        $outOfStock = Product::where('stock', 0)->get(['id', 'title', 'stock', 'updated_at']);
        foreach ($outOfStock as $product) {
            $notifications[] = [
                'id' => 'stock_out_' . $product->id,
                'type' => 'out_of_stock',
                'title' => $product->title,
                'message' => 'Out of stock',
                'product_id' => $product->id,
                'created_at' => $product->updated_at->toISOString(),
            ];
        }

        // Low stock products (stock > 0 and stock <= 10)
        $lowStock = Product::where('stock', '>', 0)
            ->where('stock', '<=', 10)
            ->get(['id', 'title', 'stock', 'updated_at']);
        foreach ($lowStock as $product) {
            $notifications[] = [
                'id' => 'stock_low_' . $product->id,
                'type' => 'low_stock',
                'title' => $product->title,
                'message' => "Only {$product->stock} left in stock",
                'product_id' => $product->id,
                'created_at' => $product->updated_at->toISOString(),
            ];
        }

        // New orders (pending, created in last 24 hours)
        $newOrders = Order::where('status', 'pending')
            ->where('created_at', '>=', Carbon::now()->subDay())
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'total', 'user_id', 'status', 'created_at']);
        foreach ($newOrders as $order) {
            $customerName = $order->user ? $order->user->name : 'Guest';
            $notifications[] = [
                'id' => 'order_' . $order->id,
                'type' => 'new_order',
                'title' => "Order #{$order->id}",
                'message' => '$' . number_format($order->total, 2) . " from {$customerName}",
                'order_id' => $order->id,
                'created_at' => $order->created_at->toISOString(),
            ];
        }

        // Sort by created_at descending
        usort($notifications, function ($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        return response()->json([
            'notifications' => $notifications,
            'counts' => [
                'total' => count($notifications),
                'out_of_stock' => count($outOfStock),
                'low_stock' => count($lowStock),
                'new_orders' => count($newOrders),
            ],
        ]);
    }
}
