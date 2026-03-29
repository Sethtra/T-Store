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
                ->get();
        });
        return response()->json($categories);
    }
}
