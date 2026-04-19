<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminExportController extends Controller
{
    /**
     * Export Orders to CSV
     */
    public function exportOrders(Request $request)
    {
        $days = $request->get('days', 30);
        $startDate = now()->subDays($days)->startOfDay();
        $endDate = now();

        $fileName = 'tstore_orders_' . now()->format('Y-m-d') . '.csv';

        $headers = array(
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        );

        $columns = [
            'Order ID', 'Tracking ID', 'Status', 'Payment Method', 'Payment Status',
            'Total', 'Customer Name', 'Customer Email', 'Shipping City', 'Created At'
        ];

        $callback = function() use($startDate, $endDate, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            Order::with('user')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->chunk(100, function ($orders) use ($file) {
                    foreach ($orders as $order) {
                        fputcsv($file, array_map([$this, 'sanitizeCsvValue'], [
                            $order->id,
                            $order->tracking_id,
                            $order->status,
                            $order->payment_method,
                            $order->payment_status,
                            $order->total,
                            $order->shipping_name ?? ($order->user ? $order->user->name : ''),
                            $order->shipping_email ?? ($order->user ? $order->user->email : ''),
                            $order->shipping_city,
                            $order->created_at->format('Y-m-d H:i:s')
                        ]));
                    }
                });

            fclose($file);
        };

        return new StreamedResponse($callback, 200, $headers);
    }

    /**
     * Export Products to CSV
     */
    public function exportProducts(Request $request)
    {
        $fileName = 'tstore_products_inventory_' . now()->format('Y-m-d') . '.csv';

        $headers = array(
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        );

        $columns = [
            'Product ID', 'Title', 'Category', 'Price', 'Stock', 'Status', 'Created At'
        ];

        $callback = function() use($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            Product::with('category')->chunk(100, function ($products) use ($file) {
                foreach ($products as $product) {
                    $status = $product->stock <= 0 ? 'Out of Stock' : ($product->stock <= 10 ? 'Low Stock' : 'In Stock');
                    
                    fputcsv($file, array_map([$this, 'sanitizeCsvValue'], [
                        $product->id,
                        $product->title,
                        $product->category ? $product->category->name : 'N/A',
                        $product->price,
                        $product->stock,
                        $status,
                        $product->created_at->format('Y-m-d H:i:s')
                    ]));
                }
            });

            fclose($file);
        };

        return new StreamedResponse($callback, 200, $headers);
    }

    /**
     * Export Users to CSV
     */
    public function exportUsers(Request $request)
    {
        $fileName = 'tstore_customers_' . now()->format('Y-m-d') . '.csv';

        $headers = array(
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        );

        $columns = [
            'User ID', 'Name', 'Email', 'Role', 'Status', 'Total Orders', 'Total Spent', 'Joined At'
        ];

        $callback = function() use($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            User::withCount('orders')
                ->withSum(['orders as total_spent' => function ($query) {
                    $query->whereIn('payment_status', ['paid', 'pending'])
                          ->where('status', '!=', 'cancelled');
                }], 'total')
                ->chunk(100, function ($users) use ($file) {
                    foreach ($users as $user) {
                        fputcsv($file, array_map([$this, 'sanitizeCsvValue'], [
                            $user->id,
                            $user->name,
                            $user->email,
                            $user->role,
                            $user->status ?? 'active',
                            $user->orders_count,
                            number_format((float) $user->total_spent, 2, '.', ''),
                            $user->created_at->format('Y-m-d H:i:s')
                        ]));
                    }
                });

            fclose($file);
        };

        return new StreamedResponse($callback, 200, $headers);
    }

    /**
     * Sanitize value for CSV to prevent Formula Injection (CSV Injection).
     * Prepending a single quote (') if the value starts with =, +, -, or @.
     */
    private function sanitizeCsvValue($value): string
    {
        if (is_null($value)) return '';
        
        $value = (string) $value;
        $vulnerableChars = ['=', '+', '-', '@'];
        
        if (!empty($value) && in_array($value[0], $vulnerableChars)) {
            return "'" . $value;
        }
        
        return $value;
    }
}
