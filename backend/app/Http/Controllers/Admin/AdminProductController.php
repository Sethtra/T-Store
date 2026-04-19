<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\SupabaseStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AdminProductController extends Controller
{
    /**
     * Get all products (paginated).
     */
    public function index(Request $request)
    {
        $query = Product::with('category')->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            // Use 'like' instead of 'ilike' to support MySQL/SQLite. Case insensitivity is default in MySQL.
            $query->where('title', 'like', "%{$request->search}%");
        }

        $perPage = min($request->limit ?? 10, 50);
        $products = $query->paginate($perPage);

        return response()->json([
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Create a new product.
     */
    public function store(Request $request)
    {
        // Fix for FormData: decode attributes if sent as JSON string
        $attributesInput = $request->input('attributes');
        if ($attributesInput && is_string($attributesInput)) {
            $decodedAttributes = json_decode($attributesInput, true);
            if (is_array($decodedAttributes)) {
                $request->merge(['attributes' => $decodedAttributes]);
            }
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'attributes' => 'nullable|array',
        ]);

        $slug = Str::slug($request->title);
        $slugExists = Product::where('slug', $slug)->exists();
        if ($slugExists) {
            $slug = $slug . '-' . Str::random(5);
        }

        // We only store the final URLs as strings
        $imageUrls = [];

        // If explicit string URLs were sent (uncommon for creation, but just in case)
        if ($request->has('images') && !is_array($request->file('images'))) {
            $inputImages = $request->input('images');
            if (is_array($inputImages)) {
                $imageUrls = array_filter($inputImages, function($img) {
                    return is_string($img) && !empty(trim($img));
                });
            }
        }

        // Handle Multiple File Uploads via Supabase Storage
        $supabase = app(SupabaseStorageService::class);
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $imageUrls[] = $supabase->upload($file, 'products');
            }
        } elseif ($request->hasFile('image')) {
            // Fallback for single file
            $imageUrls[] = $supabase->upload($request->file('image'), 'products');
        }

        $product = Product::create([
            'title' => $request->title,
            'slug' => $slug,
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
            'category_id' => $request->category_id,
            'images' => json_encode(array_values($imageUrls)), // Ensure only clean string arrays are saved
            'attributes' => $request->input('attributes') ?? [],
        ]);

        // Invalidate public caches
        Cache::forget('landing_data_all');
        Cache::forget('app_bootstrap');

        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product,
        ], 201);
    }

    /**
     * Update a product.
     */
    public function update(Request $request, int $id)
    {
        $product = Product::findOrFail($id);

        // Validate based on what's being sent
        $rules = [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'attributes' => 'nullable|array',
        ];

        // Fix for FormData: decode attributes if sent as JSON string
        $attributesInput = $request->input('attributes');
        if ($attributesInput && is_string($attributesInput)) {
            $decodedAttributes = json_decode($attributesInput, true);
            if (is_array($decodedAttributes)) {
                $request->merge(['attributes' => $decodedAttributes]);
            }
        }

        // Only validate images as files if actual files are being uploaded
        if ($request->hasFile('images')) {
            $rules['images'] = 'nullable|array';
            $rules['images.*'] = 'image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048';
        } elseif ($request->hasFile('image')) {
            $rules['image'] = 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048';
        } elseif ($request->has('images') && is_array($request->images)) {
            // If images is an array of strings (URLs), just validate as strings
            $rules['images'] = 'nullable|array';
            $rules['images.*'] = 'nullable|string';
        }

        $request->validate($rules);

        $updateData = $request->only(['title', 'description', 'price', 'stock', 'category_id', 'attributes']);

        // Handle Multiple File Uploads - Use existing_images from frontend if provided (tracks removals)
        // Otherwise fallback to database images
        $existingImages = [];

        if ($request->has('existing_images')) {
            // Frontend sent explicit list of images to keep (user may have removed some)
            $existingInput = $request->input('existing_images');

            if (is_string($existingInput)) {
                $decoded = json_decode($existingInput, true);
                $existingImages = is_array($decoded) ? $decoded : [];
            } elseif (is_array($existingInput)) {
                $existingImages = $existingInput;
            } else {
                $existingImages = [];
            }
        } else {
            // No explicit list - get current images from database
            $dbImages = $product->getRawOriginal('images');
            $existingImages = is_string($dbImages) ? (json_decode($dbImages, true) ?? []) : ($dbImages ?? []);
        }

        // Filter out any invalid entries from existing images (allow local paths or full URLs)
        $existingImages = array_values(array_filter($existingImages, function ($img) {
            return is_string($img) && !empty(trim($img));
        }));

        // Identify orphaned images that need to be deleted from Supabase
        if ($request->has('existing_images')) {
            $dbImages = $product->getRawOriginal('images');
            $oldImages = is_string($dbImages) ? (json_decode($dbImages, true) ?? []) : ($dbImages ?? []);
            
            $orphanedImages = array_diff($oldImages, $existingImages);
            
            if (!empty($orphanedImages)) {
                $supabase = app(SupabaseStorageService::class);
                foreach ($orphanedImages as $orphan) {
                    if (is_string($orphan) && str_starts_with($orphan, 'http')) {
                        try {
                            $supabase->delete($orphan);
                        } catch (\Exception $e) {
                            Log::error("Failed to delete orphaned product image from Supabase: " . $e->getMessage());
                        }
                    }
                }
            }
        }

        $newImages = [];
        // Ensure Supabase is instantiated if it hasn't been already
        $supabase = isset($supabase) ? $supabase : app(SupabaseStorageService::class);
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $newImages[] = $supabase->upload($file, 'products');
            }
        } elseif ($request->hasFile('image')) {
            $newImages[] = $supabase->upload($request->file('image'), 'products');
        }

        // If new images were uploaded, append them to existing ones
        if (!empty($newImages)) {
            $updateData['images'] = json_encode(array_merge($existingImages, $newImages));
        } elseif ($request->has('images') && is_array($request->images)) {
            // If explicit images array was sent (e.g., from URL input)
            $updateData['images'] = json_encode($request->images);
        } elseif ($request->has('existing_images')) {
            // If only existing_images was sent (user just removed some images without adding new ones)
            $updateData['images'] = json_encode($existingImages);
        }
        // If no new images and no explicit images array, don't touch the images field

        // Update slug if title changes
        if ($request->filled('title') && $request->title !== $product->title) {
            $slug = Str::slug($request->title);
            $slugExists = Product::where('slug', $slug)->where('id', '!=', $id)->exists();
            if ($slugExists) {
                $slug = $slug . '-' . Str::random(5);
            }
            $updateData['slug'] = $slug;
        }

        $product->update($updateData);

        // Invalidate public caches
        Cache::forget('landing_data_all');
        Cache::forget('app_bootstrap');

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product->fresh(),
        ]);
    }

    /**
     * Delete a product.
     */
    public function destroy(int $id)
    {
        $product = Product::findOrFail($id);

        // Delete associated files from Supabase if they exist
        if (is_array($product->images)) {
            $supabase = app(SupabaseStorageService::class);
            foreach ($product->images as $image) {
                // Only delete if it's a full URL (likely Supabase)
                if (is_string($image) && str_starts_with($image, 'http')) {
                    try {
                        $supabase->delete($image);
                    } catch (\Exception $e) {
                        // Log error but don't stop the product deletion
                        Log::error("Failed to delete product image from Supabase: " . $e->getMessage());
                    }
                }
            }
        }

        $product->delete();

        // Invalidate public caches
        Cache::forget('landing_data_all');
        Cache::forget('app_bootstrap');

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }
}
