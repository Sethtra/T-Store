<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    /**
     * Get paginated list of users with search and filters.
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Search by name or email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Sort
        $sortBy = $request->sort_by ?? 'created_at';
        $sortDir = $request->sort_dir ?? 'desc';
        $allowedSorts = ['name', 'email', 'created_at', 'role', 'status'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        $perPage = min($request->per_page ?? 15, 50);
        
        $users = $query->withCount(['orders' => function ($q) {
            $q->where('status', '!=', 'cancelled');
        }])->withSum(['orders as total_spent' => function ($q) {
            $q->where('status', '!=', 'cancelled');
        }], 'total')->paginate($perPage);

        $usersData = $users->getCollection()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ?? 'user',
                'status' => $user->status ?? 'active',
                'google_id' => $user->google_id ? true : false,
                'orders_count' => $user->orders_count ?? 0,
                'total_spent' => (float) ($user->total_spent ?? 0),
                'created_at' => $user->created_at->toISOString(),
            ];
        });

        return response()->json([
            'data' => $usersData,
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    /**
     * Get single user with order history.
     */
    public function show(int $id)
    {
        $user = User::findOrFail($id);

        // Get user's orders
        $orders = Order::where('user_id', $user->id)
            ->with('items')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'tracking_id' => $order->tracking_id,
                    'status' => $order->status,
                    'total' => (float) $order->total,
                    'items_count' => $order->items->count(),
                    'created_at' => $order->created_at->toISOString(),
                ];
            });

        // Calculate stats
        $completedOrders = Order::where('user_id', $user->id)
            ->where('status', '!=', 'cancelled');

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role ?? 'user',
            'status' => $user->status ?? 'active',
            'google_id' => $user->google_id ? true : false,
            'created_at' => $user->created_at->toISOString(),
            'stats' => [
                'total_orders' => $completedOrders->count(),
                'total_spent' => (float) $completedOrders->sum('total'),
                'last_order_at' => $orders->first() ? $orders->first()['created_at'] : null,
            ],
            'orders' => $orders,
        ]);
    }

    /**
     * Update user role or status.
     */
    public function update(Request $request, int $id)
    {
        $request->validate([
            'role' => 'sometimes|in:user,admin',
            'status' => 'sometimes|in:active,inactive',
        ]);

        $user = User::findOrFail($id);

        // Prevent admin from demoting themselves
        if ($request->has('role') && $user->id === $request->user()->id && $request->role !== 'admin') {
            return response()->json([
                'message' => 'You cannot change your own admin role.',
            ], 403);
        }

        $user->update($request->only(['role', 'status']));

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
            ],
        ]);
    }
}
