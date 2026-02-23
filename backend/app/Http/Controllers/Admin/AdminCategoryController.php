<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminCategoryController extends Controller
{
    /**
     * Get all categories with their children (hierarchical structure).
     */
    public function index()
    {
        // Get parent categories with their children and product counts
        $categories = Category::whereNull('parent_id')
            ->with([
                'children' => function ($query) {
                    $query->withCount('products');
                }
            ])
            ->withCount('products')
            ->get();

        return response()->json($categories);
    }

    /**
     * Get all categories as a flat list (for dropdowns).
     */
    public function all()
    {
        $categories = Category::withCount('products')->get();
        return response()->json($categories);
    }

    /**
     * Store a new category or subcategory.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
        ]);

        // Generate slug from name
        $validated['slug'] = Str::slug($validated['name']);

        // Ensure subcategories can't have their own subcategories (max 2 levels)
        if (isset($validated['parent_id'])) {
            $parent = Category::find($validated['parent_id']);
            if ($parent && $parent->parent_id !== null) {
                return response()->json([
                    'message' => 'Subcategories cannot have their own subcategories.'
                ], 422);
            }
        }

        $category = Category::create($validated);

        return response()->json($category->load('children'), 201);
    }

    /**
     * Update a category.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
        ]);

        // Update slug if name changed
        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Prevent category from being its own parent
        if (isset($validated['parent_id']) && $validated['parent_id'] == $category->id) {
            return response()->json([
                'message' => 'A category cannot be its own parent.'
            ], 422);
        }

        // Prevent moving a parent category to be a subcategory if it has children
        if (isset($validated['parent_id']) && $category->children()->count() > 0) {
            return response()->json([
                'message' => 'Cannot make a parent category a subcategory while it has children.'
            ], 422);
        }

        $category->update($validated);

        return response()->json($category->load('children'));
    }

    /**
     * Delete a category.
     */
    public function destroy(Category $category)
    {
        // Children will be deleted via cascade
        $category->delete();

        return response()->json(null, 204);
    }
}
