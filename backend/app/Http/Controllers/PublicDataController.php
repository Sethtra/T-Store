<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use App\Models\Category;
use App\Models\CategoryDisplay;
use App\Models\LandingSection;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PublicDataController extends Controller
{
    /**
     * Get global application data (Bootstrap).
     * Used by Navbar and Layout.
     */
    public function getAppBootstrap()
    {
        $data = Cache::remember('app_bootstrap', 3600, function () {
            return [
                'categories' => Category::whereNull('parent_id')
                    ->with('children')
                    ->orderBy('name')
                    ->get(),
                'version' => config('app.version', '1.0.0'),
            ];
        });

        return response()->json($data);
    }

    /**
     * Get all data required for the homepage in a single request.
     */
    public function getLandingData()
    {
        $data = Cache::remember('landing_data_all', 3600, function () {
            return [
                'banners' => [
                    'main' => Banner::main()->active()->ordered()->get(),
                    'section' => Banner::section()->active()->ordered()->get(),
                ],
                'featured_products' => Product::with('category')
                    ->where('stock', '>', 0)
                    ->orderBy('created_at', 'desc')
                    ->take(8)
                    ->get(),
                'landing_sections' => LandingSection::with('product.category')
                    ->active()
                    ->ordered()
                    ->get()
                    ->map(function ($section) {
                        $productImages = $section->product ? $section->product->images : [];
                        $firstProductImage = (is_array($productImages) && count($productImages) > 0) ? $productImages[0] : null;

                        $imageUrl = $section->image
                            ? (str_starts_with($section->image, 'http') ? $section->image : asset('storage/' . $section->image))
                            : $firstProductImage;

                        return [
                            'id' => $section->id,
                            'section_type' => $section->section_type,
                            'title' => $section->title ?? $section->product?->title,
                            'title_kh' => $section->title_kh ?? $section->product?->title_kh,
                            'description' => $section->description ?? $section->product?->description,
                            'description_kh' => $section->description_kh ?? $section->product?->description_kh,
                            'image' => $section->image,
                            'order' => $section->order,
                            'product' => $section->product ? [
                                'id' => $section->product->id,
                                'title' => $section->product->title,
                                'title_kh' => $section->product->title_kh,
                                'slug' => $section->product->slug,
                                'price' => $section->product->price,
                                'image_url' => $imageUrl,
                                'images' => $section->product->images,
                                'category' => $section->product->category?->name,
                                'category_kh' => $section->product->category?->name_kh,
                            ] : null,
                        ];
                    }),
                'category_displays' => CategoryDisplay::where('is_active', true)
                    ->orderBy('position', 'asc')
                    ->get(),
            ];
        });

        return response()->json($data);
    }
}
