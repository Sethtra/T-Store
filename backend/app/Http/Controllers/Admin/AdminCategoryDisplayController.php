<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CategoryDisplay;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
            'description' => 'nullable|string',
            'image_url' => 'nullable|string|max:500',
            'button_text' => 'sometimes|required|string|max:100',
            'link' => 'nullable|string|max:500',
            'is_active' => 'sometimes|boolean',
            'order' => 'sometimes|integer|min:0',
        ]);

        $categoryDisplay->update($validated);

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

        // Delete old image if it exists and is stored locally
        if ($categoryDisplay->image_url && str_starts_with($categoryDisplay->image_url, url('storage/'))) {
            $oldPath = str_replace(url('storage/'), '', $categoryDisplay->image_url);
            Storage::disk('public')->delete($oldPath);
        }

        // Store new image
        $file = $request->file('image');
        $path = $file->store('category-displays', 'public');
        $imageUrl = url('storage/' . $path);

        $categoryDisplay->update(['image_url' => $imageUrl]);

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
        if ($categoryDisplay->image_url && str_starts_with($categoryDisplay->image_url, url('storage/'))) {
            $path = str_replace(url('storage/'), '', $categoryDisplay->image_url);
            Storage::disk('public')->delete($path);
        }

        $categoryDisplay->update(['image_url' => null]);

        return response()->json($categoryDisplay->load('category'));
    }
}
