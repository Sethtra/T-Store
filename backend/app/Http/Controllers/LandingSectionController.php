<?php

namespace App\Http\Controllers;

use App\Models\LandingSection;
use Illuminate\Http\JsonResponse;

class LandingSectionController extends Controller
{
    /**
     * Get active landing sections with product data for public display.
     */
    public function index(): JsonResponse
    {
        $sections = LandingSection::with('product')
            ->active()
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
                    'order' => $section->order,
                    'product' => [
                        'id' => $section->product->id,
                        'name' => $section->product->title,
                        'slug' => $section->product->slug,
                        'price' => $section->product->price,
                        'image_url' => $imageUrl,
                        'category' => $section->product->category?->name,
                    ],
                ];
            });

        return response()->json($sections);
    }
}

