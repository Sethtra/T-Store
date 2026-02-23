<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Get paginated products with filters.
     */
    public function index(Request $request)
    {
        $query = Product::with('category');

        // Search (Full-Text or LIKE)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%");
            });
        }

        // Category filter (Recursive: Parent -> Children)
        if ($request->filled('category')) {
            $slug = $request->category;
            $query->whereHas('category', function ($q) use ($slug) {
                // Find the category by slug
                $q->where('slug', $slug)
                    ->orWhereHas('parent', function ($subQ) use ($slug) {
                        // Or where the parent has this slug (1 level deep)
                        $subQ->where('slug', $slug);
                    });
            });

            // Note: For deeper nesting, we might need a more robust approach:
            // 1. Fetch Category ID by Slug
            // 2. Get all children IDs (recursive)
            // 3. Filter whereIn('category_id', [ids])

            // Let's implement the robust approach:
            $category = \App\Models\Category::where('slug', $slug)->first();
            if ($category) {
                // Get this category ID and all children IDs
                $categoryIds = [$category->id];
                if ($category->children()->exists()) {
                    $categoryIds = array_merge($categoryIds, $category->children()->pluck('id')->toArray());
                }

                // Overwrite the previous simple whereHas with specific ID check
                // We restart the query constraint for category
                $query->whereIn('category_id', $categoryIds);
            }
        }

        // Price range filter
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Sorting
        switch ($request->sort) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'popular':
                // Could be based on order count in future
                $query->orderBy('stock', 'desc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
        }

        $perPage = min($request->limit ?? 12, 50); // Max 50 items per page
        $products = $query->paginate($perPage);

        return response()->json([
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Get featured products.
     */
    public function featured()
    {
        $products = Product::with('category')
            ->where('stock', '>', 0)
            ->orderBy('created_at', 'desc')
            ->take(8)
            ->get();

        return response()->json($products);
    }

    /**
     * Get single product by slug.
     */
    public function show(string $slug)
    {
        $product = Product::with('category')
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json($product);
    }
}
