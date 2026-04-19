<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CategoryDisplay;
use App\Services\SupabaseStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminCategoryDisplayController extends Controller
{
    /**
     * Get all category displays.
     */
    public function index()
    {
        $displays = CategoryDisplay::with('category')
            ->ordered()
            ->get();

        return response()->json($displays);
    }

    /**
     * Get a single category display.
     */
    public function show(CategoryDisplay $categoryDisplay)
    {
        return response()->json($categoryDisplay->load('category'));
    }

    /**
     * Update a category display.
     */
    public function update(Request $request, CategoryDisplay $categoryDisplay)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'title' => 'sometimes|required|string|max:255',
            'title_kh' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'description_kh' => 'nullable|string',
            'image_url' => 'nullable|string|max:500',
            'button_text' => 'sometimes|required|string|max:100',
            'button_text_kh' => 'nullable|string|max:100',
            'link' => 'nullable|string|max:500',
            'is_active' => 'sometimes|boolean',
            'order' => 'sometimes|integer|min:0',
        ]);

        $categoryDisplay->update($validated);

        // Clear the public cache so frontend picks up changes immediately
        Cache::forget('category_displays_index');
        Cache::forget('landing_data_all');

        return response()->json($categoryDisplay->load('category'));
    }

    /**
     * Upload an image for a category display.
     */
    public function uploadImage(Request $request, CategoryDisplay $categoryDisplay)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        // Delete old image from Supabase if it exists
        $supabase = app(SupabaseStorageService::class);
        if ($categoryDisplay->image_url) {
            $supabase->delete($categoryDisplay->image_url);
        }

        // Upload new image to Supabase
        $imageUrl = $supabase->upload($request->file('image'), 'category-displays');

        $categoryDisplay->update(['image_url' => $imageUrl]);

        // Clear the public cache so frontend picks up changes immediately
        Cache::forget('category_displays_index');
        Cache::forget('landing_data_all');

        return response()->json([
            'image_url' => $imageUrl,
            'display' => $categoryDisplay->load('category'),
        ]);
    }

    /**
     * Delete the image from a category display.
     */
    public function deleteImage(CategoryDisplay $categoryDisplay)
    {
        if ($categoryDisplay->image_url) {
            $supabase = app(SupabaseStorageService::class);
            $supabase->delete($categoryDisplay->image_url);
        }

        $categoryDisplay->update(['image_url' => null]);

        // Clear the public cache so frontend picks up changes immediately
        Cache::forget('category_displays_index');
        Cache::forget('landing_data_all');

        return response()->json($categoryDisplay->load('category'));
    }
}
