<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

use App\Models\Visit;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics.
     */
    public function index()
    {
        $now = Carbon::now();

        // Total stats
        $totalOrders = Order::count();
        $totalRevenue = Order::where('status', '!=', 'cancelled')->sum('total');
        $pendingOrders = Order::where('status', 'pending')->count();
        $totalUsers = User::count();
        $totalVisitors = Visit::count();

        // Revenue by period (use copy() to avoid mutating $now)
        $revenueByPeriod = [
            'day' => Order::where('status', '!=', 'cancelled')
                ->whereDate('created_at', Carbon::today()->toDateString())
                ->sum('total'),
            'week' => Order::where('status', '!=', 'cancelled')
                ->whereBetween('created_at', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ])
                ->sum('total'),
            'month' => Order::where('status', '!=', 'cancelled')
                ->whereYear('created_at', Carbon::now()->year)
                ->whereMonth('created_at', Carbon::now()->month)
                ->sum('total'),
            'year' => Order::where('status', '!=', 'cancelled')
                ->whereYear('created_at', Carbon::now()->year)
                ->sum('total'),
        ];

        // Recent orders
        $recentOrders = Order::with('items')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return response()->json([
            'totalOrders' => $totalOrders,
            'totalRevenue' => (float) $totalRevenue,
            'pendingOrders' => $pendingOrders,
            'totalUsers' => $totalUsers,
            'revenueByPeriod' => $revenueByPeriod,
            'recentOrders' => $recentOrders,
            'totalVisitors' => $totalVisitors,
        ]);
    }
}
