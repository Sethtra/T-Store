<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminReportController extends Controller
{
    /**
     * Get summary metrics for a date range compared to previous period.
     */
    public function salesSummary(Request $request)
    {
        $days = $request->get('days', 30);
        $endDate = Carbon::now();
        $startDate = Carbon::now()->subDays($days)->startOfDay();
        
        // Previous period for comparison
        $prevEndDate = clone $startDate;
        $prevEndDate->subSeconds(1);
        $prevStartDate = clone $prevEndDate;
        $prevStartDate->subDays($days)->startOfDay();

        // Current period stats
        $currentOrders = Order::whereBetween('created_at', [$startDate, $endDate])
            ->whereIn('payment_status', ['paid', 'pending'])
            ->where('status', '!=', 'cancelled');
            
        $currentRevenue = $currentOrders->sum('total');
        $currentOrderCount = $currentOrders->count();
        $currentAvgOrderValue = $currentOrderCount > 0 ? $currentRevenue / $currentOrderCount : 0;
        
        $newUsersCurrent = User::whereBetween('created_at', [$startDate, $endDate])->count();

        // Previous period stats
        $prevOrders = Order::whereBetween('created_at', [$prevStartDate, $prevEndDate])
            ->whereIn('payment_status', ['paid', 'pending'])
            ->where('status', '!=', 'cancelled');
            
        $prevRevenue = $prevOrders->sum('total');
        $prevOrderCount = $prevOrders->count();
        $prevAvgOrderValue = $prevOrderCount > 0 ? $prevRevenue / $prevOrderCount : 0;
        
        $newUsersPrev = User::whereBetween('created_at', [$prevStartDate, $prevEndDate])->count();

        // Calculate % changes
        $calculateChange = function ($current, $previous) {
            if ($previous == 0) return $current > 0 ? 100 : 0;
            return round((($current - $previous) / $previous) * 100, 2);
        };

        return response()->json([
            'summary' => [
                'revenue' => [
                    'value' => round($currentRevenue, 2),
                    'change' => $calculateChange($currentRevenue, $prevRevenue),
                ],
                'orders' => [
                    'value' => $currentOrderCount,
                    'change' => $calculateChange($currentOrderCount, $prevOrderCount),
                ],
                'avg_order_value' => [
                    'value' => round($currentAvgOrderValue, 2),
                    'change' => $calculateChange($currentAvgOrderValue, $prevAvgOrderValue),
                ],
                'new_customers' => [
                    'value' => $newUsersCurrent,
                    'change' => $calculateChange($newUsersCurrent, $newUsersPrev),
                ],
            ],
            'period' => [
                'start' => $startDate->toDateString(),
                'end' => $endDate->toDateString(),
                'days' => $days
            ]
        ]);
    }

    /**
     * Get revenue chart data (daily or monthly depending on range).
     */
    public function revenueChart(Request $request)
    {
        $days = (int) $request->get('days', 30);
        $startDate = Carbon::now()->subDays($days)->startOfDay();
        $endDate = Carbon::now();

        // Determine if we should group by day or month
        $format = $days > 90 ? '%Y-%m' : '%Y-%m-%d';

        $revenueData = Order::whereBetween('created_at', [$startDate, $endDate])
            ->whereIn('payment_status', ['paid', 'pending'])
            ->where('status', '!=', 'cancelled')
            ->select(
                DB::raw("DATE_FORMAT(created_at, '{$format}') as date"),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(id) as orders_count')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        return response()->json([
            'data' => $revenueData
        ]);
    }

    /**
     * Get top selling products by revenue or quantity.
     */
    public function topProducts(Request $request)
    {
        $days = $request->get('days', 30);
        $limit = $request->get('limit', 5);
        
        $startDate = Carbon::now()->subDays($days)->startOfDay();
        $endDate = Carbon::now();

        $topProducts = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->whereIn('orders.payment_status', ['paid', 'pending'])
            ->where('orders.status', '!=', 'cancelled')
            ->select(
                'products.id',
                'products.title',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.quantity * order_items.price) as total_revenue')
            )
            ->groupBy('products.id', 'products.title')
            ->orderBy('total_revenue', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'data' => $topProducts
        ]);
    }
}
