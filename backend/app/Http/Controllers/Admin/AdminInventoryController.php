<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminInventoryController extends Controller
{
    /**
     * Get paginated products with stock info.
     */
    public function index(Request $request)
    {
        $query = Product::with('category');

        // Search by title or SKU (if you had SKU)
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('title', 'ilike', "%{$search}%");
        }

        // Filter by stock status
        if ($request->has('status')) {
            $status = $request->status;
            if ($status === 'out') {
                $query->where('stock', '<=', 0);
            } elseif ($status === 'low') {
                $query->whereBetween('stock', [1, 10]); // Assuming 10 is low stock threshold
            } elseif ($status === 'in') {
                $query->where('stock', '>', 10);
            }
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        // Sort by stock level, low to high by default
        $sort = $request->get('sort', 'stock');
        $order = $request->get('order', 'asc');
        $query->orderBy($sort, $order);

        $products = $query->paginate($request->get('per_page', 10));

        return response()->json([
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ]
        ]);
    }

    /**
     * Get stock movement history for a specific product.
     */
    public function history($productId)
    {
        $product = Product::findOrFail($productId);
        
        $movements = StockMovement::with('createdBy:id,name')
            ->where('product_id', $productId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'product' => [
                'id' => $product->id,
                'title' => $product->title,
                'stock' => $product->stock,
            ],
            'movements' => $movements->items(),
            'meta' => [
                'current_page' => $movements->currentPage(),
                'last_page' => $movements->lastPage(),
                'total' => $movements->total(),
            ]
        ]);
    }

    /**
     * Manually adjust stock for a single product.
     */
    public function adjust(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity_change' => 'required|integer|not_in:0',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request) {
            $product = Product::findOrFail($request->product_id);
            
            // Prevent negative stock
            $newStock = $product->stock + $request->quantity_change;
            if ($newStock < 0) {
                return response()->json([
                    'message' => 'Adjustment would result in negative stock coverage.',
                ], 400);
            }

            // Record movement
            $movement = StockMovement::create([
                'product_id' => $product->id,
                'quantity_change' => $request->quantity_change,
                'type' => 'adjustment',
                'notes' => $request->notes,
                'created_by' => $request->user()->id,
            ]);

            // Update product stock
            $product->stock = $newStock;
            $product->save();

            return response()->json([
                'message' => 'Stock adjusted successfully.',
                'product' => $product,
                'movement' => $movement->load('createdBy:id,name'),
            ]);
        });
    }

    /**
     * Bulk adjust stock for multiple products.
     */
    public function bulkAdjust(Request $request)
    {
        $request->validate([
            'adjustments' => 'required|array|min:1',
            'adjustments.*.product_id' => 'required|exists:products,id',
            'adjustments.*.quantity_change' => 'required|integer|not_in:0',
            'notes' => 'nullable|string',
        ]);

        $results = [];
        $errors = [];

        DB::transaction(function () use ($request, &$results, &$errors) {
            foreach ($request->adjustments as $adjustment) {
                $product = Product::find($adjustment['product_id']);
                
                $newStock = $product->stock + $adjustment['quantity_change'];
                
                if ($newStock < 0) {
                    $errors[] = "Adjustment for {$product->title} would result in negative stock.";
                    continue;
                }

                // Record movement
                StockMovement::create([
                    'product_id' => $product->id,
                    'quantity_change' => $adjustment['quantity_change'],
                    'type' => 'adjustment',
                    'notes' => $request->notes ?? 'Bulk adjustment',
                    'created_by' => $request->user()->id,
                ]);

                // Update product
                $product->stock = $newStock;
                $product->save();
                
                $results[] = $product->id;
            }
        });

        if (count($errors) > 0) {
            return response()->json([
                'message' => 'Completed with some errors.',
                'errors' => $errors,
                'updated_count' => count($results),
            ], 207); // 207 Multi-Status
        }

        return response()->json([
            'message' => 'Bulk stock adjustment successful.',
            'updated_count' => count($results),
        ]);
    }
}
