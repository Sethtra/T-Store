<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    /**
     * Get all categories.
     */
    public function index()
    {
        $categories = Cache::remember('categories_index', 3600, function () {
            return Category::whereNull('parent_id')
                ->with('children')
                ->orderBy('name')
                ->get()
                ->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'name_kh' => $category->name_kh ?? $category->name,
                        'slug' => $category->slug,
                        'banner_image' => $category->banner_image 
                            ? (str_starts_with($category->banner_image, 'http') ? $category->banner_image : asset('storage/' . $category->banner_image))
                            : null,
                        'children' => $category->children->map(function ($child) {
                            return [
                                'id' => $child->id,
                                'name' => $child->name,
                                'name_kh' => $child->name_kh ?? $child->name,
                                'slug' => $child->slug,
                                'banner_image' => $child->banner_image 
                                    ? (str_starts_with($child->banner_image, 'http') ? $child->banner_image : asset('storage/' . $child->banner_image))
                                    : null,
                            ];
                        })
                    ];
                });
        });
        return response()->json($categories);
    }
}
