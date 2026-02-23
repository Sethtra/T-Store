<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LandingSection;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LandingSectionController extends Controller
{
    /**
     * Display a listing of landing sections.
     */
    public function index(): JsonResponse
    {
        $sections = LandingSection::with('product.category')
            ->ordered()
            ->get()
            ->map(function ($section) {
                // Use custom image if set, otherwise use product image
                $imageUrl = $section->image
                    ? asset('storage/' . $section->image)
                    : ($section->product->images[0] ?? null);

                return [
                    'id' => $section->id,
                    'section_type' => $section->section_type,
                    'title' => $section->title ?? $section->product->title,
                    'description' => $section->description ?? $section->product->description,
                    'custom_image' => $section->image ? asset('storage/' . $section->image) : null,
                    'is_active' => $section->is_active,
                    'order' => $section->order,
                    'product' => [
                        'id' => $section->product->id,
                        'title' => $section->product->title,
                        'slug' => $section->product->slug,
                        'price' => $section->product->price,
                        'image_url' => $imageUrl,
                        'category' => $section->product->category?->name,
                    ],
                ];
            });

        return response()->json($sections);
    }

    /**
     * Store a newly created landing section.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'section_type' => 'required|in:hero_main,hero_featured,hero_small',
            'product_id' => 'required|exists:products,id',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'is_active' => 'boolean',
            'order' => 'integer',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('landing-sections', 'public');
        }

        $section = LandingSection::create($validated);
        $section->load('product');

        return response()->json($section, 201);
    }

    /**
     * Display the specified landing section.
     */
    public function show(LandingSection $landingSection): JsonResponse
    {
        $landingSection->load('product');
        return response()->json($landingSection);
    }

    /**
     * Update the specified landing section.
     */
    public function update(Request $request, LandingSection $landingSection): JsonResponse
    {
        $validated = $request->validate([
            'section_type' => 'sometimes|in:hero_main,hero_featured,hero_small',
            'product_id' => 'sometimes|exists:products,id',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'is_active' => 'boolean',
            'order' => 'integer',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($landingSection->image) {
                \Storage::disk('public')->delete($landingSection->image);
            }
            $validated['image'] = $request->file('image')->store('landing-sections', 'public');
        }

        // Allow clearing the image
        if ($request->has('clear_image') && $request->clear_image) {
            if ($landingSection->image) {
                \Storage::disk('public')->delete($landingSection->image);
            }
            $validated['image'] = null;
        }

        $landingSection->update($validated);
        $landingSection->load('product');

        return response()->json($landingSection);
    }

    /**
     * Remove the specified landing section.
     */
    public function destroy(LandingSection $landingSection): JsonResponse
    {
        // Delete associated image
        if ($landingSection->image) {
            \Storage::disk('public')->delete($landingSection->image);
        }

        $landingSection->delete();
        return response()->json(null, 204);
    }
}
