<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class AdminProductController extends Controller
{
    /**
     * Get all products (paginated).
     */
    public function index(Request $request)
    {
        $query = Product::with('category')->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $query->where('title', 'LIKE', "%{$request->search}%");
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

        $images = $request->images ?? [];

        // Handle Multiple File Uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('products', 'public');
                $images[] = url('storage/' . $path);
            }
        } elseif ($request->hasFile('image')) {
            // Fallback for single file
            $path = $request->file('image')->store('products', 'public');
            $images[] = url('storage/' . $path);
        }

        $product = Product::create([
            'title' => $request->title,
            'slug' => $slug,
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
            'category_id' => $request->category_id,
            'images' => json_encode($images), // Ensure images are stored as JSON string
            'attributes' => $request->input('attributes') ?? [],
        ]);

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
            \Log::info('Existing Images Input:', ['type' => gettype($existingInput), 'value' => $existingInput]);

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

        // Filter out any invalid entries from existing images
        $existingImages = array_values(array_filter($existingImages, function ($img) {
            return is_string($img) && !empty($img) && filter_var($img, FILTER_VALIDATE_URL);
        }));

        $newImages = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('products', 'public');
                $newImages[] = url('storage/' . $path);
            }
        } elseif ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $newImages[] = url('storage/' . $path);
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
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }
}
