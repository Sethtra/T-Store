<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
    /**
     * Get paginated products with filters.
     */
    public function index(Request $request)
    {
        $params = $request->all();
        ksort($params);
        $queryString = http_build_query($params);
        
        $cacheVersion = \Illuminate\Support\Facades\Cache::get('products_cache_version', 1);
        $cacheKey = 'products_index_' . $cacheVersion . '_' . md5($queryString);

        $response = Cache::remember($cacheKey, 3600, function () use ($request) {
            $query = Product::with('category');

        // Search (Full-Text or LIKE)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%");
            });
        }

        // Category filter (Recursive: Parent -> Children)
        if ($request->filled('category')) {
            $slug = $request->category;
            $category = \App\Models\Category::where('slug', $slug)->first();
            if ($category) {
                // Get this category ID and all children IDs
                $categoryIds = [$category->id];
                if ($category->children()->exists()) {
                    $categoryIds = array_merge($categoryIds, $category->children()->pluck('id')->toArray());
                }
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

        return [
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ];
    });

    return response()->json($response);
}

    /**
     * Get featured products.
     */
    public function featured()
    {
        $products = Cache::remember('products_featured', 3600, function () {
            return Product::with('category')
                ->where('stock', '>', 0)
                ->orderBy('created_at', 'desc')
                ->take(8)
                ->get();
        });

        return response()->json($products);
    }

    /**
     * Get single product by slug.
     */
    public function show(string $slug)
    {
        $cacheKey = 'product_show_' . $slug;

        $product = Cache::remember($cacheKey, 3600, function () use ($slug) {
            return Product::with('category')
                ->where('slug', $slug)
                ->firstOrFail();
        });

        return response()->json($product);
    }
}
