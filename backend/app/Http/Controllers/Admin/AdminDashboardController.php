<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Visit;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    /**
     * Get consolidated dashboard statistics and recent orders.
     * Bundles multiple statistical queries into one to save connections.
     */
    public function index()
    {
        // 1. Basic Counts
        $totalOrders = Order::count();
        $totalUsers = User::count();
        $totalRevenue = Order::where('payment_status', 'paid')->sum('total');
        $totalVisitors = Visit::count();
        $pendingOrders = Order::where('status', 'pending')->count();

        // 2. Revenue by Period (Handled in a single query cluster)
        $now = Carbon::now();
        $revenueByPeriod = [
            'day' => Order::where('payment_status', 'paid')
                ->whereDate('created_at', $now->toDateString())
                ->sum('total'),
            'week' => Order::where('payment_status', 'paid')
                ->whereBetween('created_at', [$now->startOfWeek()->toDateTimeString(), $now->endOfWeek()->toDateTimeString()])
                ->sum('total'),
            'month' => Order::where('payment_status', 'paid')
                ->whereMonth('created_at', $now->month)
                ->whereYear('created_at', $now->year)
                ->sum('total'),
            'year' => Order::where('payment_status', 'paid')
                ->whereYear('created_at', $now->year)
                ->sum('total'),
        ];

        // 3. Recent Orders (Top 10)
        $recentOrders = Order::orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return response()->json([
            'stats' => [
                'totalOrders' => $totalOrders,
                'totalUsers' => $totalUsers,
                'totalRevenue' => $totalRevenue,
                'totalVisitors' => $totalVisitors,
                'pendingOrders' => $pendingOrders,
                'revenueByPeriod' => $revenueByPeriod,
            ],
            'recent_orders' => $recentOrders,
        ]);
    }
}
