<?php

namespace App\Http\Controllers;

use App\Models\LandingSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class LandingSectionController extends Controller
{
    /**
     * Get active landing sections with product data for public display.
     */
    public function index(): JsonResponse
    {
        $sections = Cache::remember('landing_sections_index', 3600, function () {
            return LandingSection::with('product')
                ->active()
                ->ordered()
                ->get()
                ->map(function ($section) {
                    // Use custom image if set, otherwise use product image
                    // Image is now a full Supabase URL (or legacy local path)
                    // Defensive check for product images array
                    $productImages = $section->product ? $section->product->images : [];
                    $firstProductImage = (is_array($productImages) && count($productImages) > 0) ? $productImages[0] : null;

                    $imageUrl = $section->image
                        ? (str_starts_with($section->image, 'http') ? $section->image : asset('storage/' . $section->image))
                        : $firstProductImage;

                    return [
                        'id' => $section->id,
                        'section_type' => $section->section_type,
                        'title' => $section->title ?? $section->product?->title,
                        'description' => $section->description ?? $section->product?->description,
                        'order' => $section->order,
                        'product' => $section->product ? [
                            'id' => $section->product->id,
                            'name' => $section->product->title,
                            'slug' => $section->product->slug,
                            'price' => $section->product->price,
                            'image_url' => $imageUrl,
                            'category' => $section->product->category?->name,
                        ] : null,
                    ];
                });
        });

        return response()->json($sections);
    }
}

