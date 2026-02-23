<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminBannerController extends Controller
{
    public function index()
    {
        $banners = Banner::orderBy('type')->orderBy('order')->get();

        return response()->json([
            'main' => $banners->where('type', 'main')->values(),
            'section' => $banners->where('type', 'section')->values(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:main,section',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'image_url' => 'nullable|string',
            'title' => 'required|string|max:255',
            'title_gradient' => 'nullable|string',
            'text_color' => 'nullable|string|max:50',
            'tag' => 'nullable|string|max:100',
            'description' => 'required|string',
            'primary_button_text' => 'nullable|string|max:100',
            'primary_button_link' => 'nullable|string|max:255',
            'secondary_button_text' => 'nullable|string|max:100',
            'secondary_button_link' => 'nullable|string|max:255',
            'button_text' => 'nullable|string|max:100',
            'button_link' => 'nullable|string|max:255',
            'is_active' => 'sometimes|boolean',
            'order' => 'sometimes|integer',
        ]);

        // Set defaults
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['order'] = $validated['order'] ?? 0;

        // Handle image upload - REQUIRED
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $path = $file->store('banners', 'public');
            $validated['image'] = asset('storage/' . $path);
        } elseif ($request->filled('image_url')) {
            $validated['image'] = $request->input('image_url');
        } else {
            return response()->json([
                'message' => 'Either an image file or image URL is required.',
                'errors' => ['image' => ['An image is required']]
            ], 422);
        }

        $banner = Banner::create($validated);

        return response()->json($banner, 201);
    }

    public function show(Banner $banner)
    {
        return response()->json($banner);
    }

    public function update(Request $request, Banner $banner)
    {
        $validated = $request->validate([
            'type' => 'sometimes|required|in:main,section',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'image_url' => 'nullable|string',
            'title' => 'sometimes|required|string|max:255',
            'title_gradient' => 'nullable|string',
            'text_color' => 'nullable|string|max:50',
            'tag' => 'nullable|string|max:100',
            'description' => 'sometimes|required|string',
            'primary_button_text' => 'nullable|string|max:100',
            'primary_button_link' => 'nullable|string|max:255',
            'secondary_button_text' => 'nullable|string|max:100',
            'secondary_button_link' => 'nullable|string|max:255',
            'button_text' => 'nullable|string|max:100',
            'button_link' => 'nullable|string|max:255',
            'is_active' => 'sometimes|boolean',
            'order' => 'sometimes|integer',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if it exists and is stored locally
            if ($banner->image && str_starts_with($banner->image, url('storage/'))) {
                $oldPath = str_replace(url('storage/'), '', $banner->image);
                Storage::disk('public')->delete($oldPath);
            }

            $file = $request->file('image');
            $path = $file->store('banners', 'public');
            $validated['image'] = asset('storage/' . $path);
        } elseif ($request->filled('image_url')) {
            // Delete old image if replacing with URL
            if ($banner->image && str_starts_with($banner->image, url('storage/'))) {
                $oldPath = str_replace(url('storage/'), '', $banner->image);
                Storage::disk('public')->delete($oldPath);
            }
            $validated['image'] = $request->input('image_url');
        }

        $banner->update($validated);

        return response()->json($banner);
    }

    public function destroy(Banner $banner)
    {
        // Delete image if it exists
        if ($banner->image && str_starts_with($banner->image, url('storage/'))) {
            $path = str_replace(url('storage/'), '', $banner->image);
            Storage::disk('public')->delete($path);
        }

        $banner->delete();

        return response()->json(null, 204);
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'banners' => 'required|array',
            'banners.*.id' => 'required|exists:banners,id',
            'banners.*.order' => 'required|integer',
        ]);

        foreach ($validated['banners'] as $bannerData) {
            Banner::where('id', $bannerData['id'])->update(['order' => $bannerData['order']]);
        }

        return response()->json(['message' => 'Banners reordered successfully']);
    }
}
