<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductColor;
use App\Services\SupabaseStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AdminProductController extends Controller
{
    /**
     * Get all products (paginated).
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'colors', 'variants'])->orderBy('created_at', 'desc');

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
            'original_price' => 'nullable|numeric|gt:price',
            'stock' => 'required|integer|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'attributes' => 'nullable|array',
            ...$this->colorRules(),
        ]);

        // Check every memory option before anything is saved
        $variantRows = $this->parseVariants($request);

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
            'original_price' => $request->original_price,
            'stock' => $request->stock,
            'category_id' => $request->category_id,
            'images' => json_encode(array_values($imageUrls)), // Ensure only clean string arrays are saved
            'attributes' => $request->input('attributes') ?? [],
            'specs' => $this->sanitizeSpecs($request->input('specs')),
        ]);

        $this->syncColors($request, $product);
        $this->saveVariants($product, $variantRows);

        // Invalidate public caches
        Cache::forget('landing_data_all');
        Cache::forget('app_bootstrap');

        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product->fresh(['colors', 'variants']),
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
            'original_price' => 'nullable|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'attributes' => 'nullable|array',
            ...$this->colorRules(),
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

        // Check every memory option before anything is saved
        $variantRows = $this->parseVariants($request);

        $updateData = $request->only(['title', 'description', 'price', 'original_price', 'stock', 'category_id', 'attributes']);
        if ($request->has('specs')) {
            $updateData['specs'] = $this->sanitizeSpecs($request->input('specs'));
        }

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
        $this->syncColors($request, $product);
        $this->saveVariants($product, $variantRows);

        // Invalidate public caches
        Cache::forget('landing_data_all');
        Cache::forget('app_bootstrap');

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product->fresh(['colors', 'variants']),
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

        // Colour photo sets live in storage too; the rows go with the product (cascade)
        foreach ($product->colors as $color) {
            $this->deleteImages($color->imageUrls());
        }

        $product->delete();

        // Invalidate public caches
        Cache::forget('landing_data_all');
        Cache::forget('app_bootstrap');

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }

    /**
     * Phone specification groups and the fields each one accepts.
     * "text" is free text; the rest are typed so they can be filtered and shown on cards.
     */
    private const SPEC_SCHEMA = [
        'display' => ['text' => 'string', 'size_in' => 'number', 'refresh_hz' => 'number'],
        'chipset' => ['text' => 'string'],
        'rear_camera' => ['text' => 'string'],
        'front_camera' => ['text' => 'string'],
        'battery' => ['text' => 'string', 'mah' => 'number'],
        'build' => ['text' => 'string'],
        'software' => ['text' => 'string', 'os' => 'os'],
        'brightness' => ['text' => 'string', 'nits' => 'number'],
        'memory' => ['text' => 'string'],
        'charging' => ['text' => 'string', 'watts' => 'number'],
        'size_weight' => ['text' => 'string', 'weight_g' => 'number'],
        'connectivity' => ['text' => 'string', 'five_g' => 'bool', 'nfc' => 'bool', 'esim' => 'bool', 'wifi7' => 'bool'],
    ];

    private const OS_OPTIONS = ['Android', 'iOS', 'HarmonyOS', 'Other'];

    /**
     * Keep only known spec groups/fields with the right types. Returns null when nothing is filled.
     */
    private function sanitizeSpecs(mixed $input): ?array
    {
        if (is_string($input)) {
            $input = json_decode($input, true);
        }
        if (!is_array($input)) {
            return null;
        }

        $clean = [];
        foreach (self::SPEC_SCHEMA as $group => $fields) {
            $values = $input[$group] ?? null;
            if (!is_array($values)) {
                continue;
            }
            foreach ($fields as $field => $type) {
                $value = $values[$field] ?? null;
                $value = match ($type) {
                    'string' => is_string($value) && trim($value) !== '' ? mb_substr(trim($value), 0, 1000) : null,
                    'number' => is_numeric($value) && (float) $value >= 0 ? round((float) $value, 2) : null,
                    'bool' => filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ? true : null,
                    'os' => in_array($value, self::OS_OPTIONS, true) ? $value : null,
                };
                if ($value !== null) {
                    $clean[$group][$field] = $value;
                }
            }
        }

        return $clean ?: null;
    }

    /**
     * Validation for the colour list: `colors` is a JSON array, photos arrive as color_images[index][angle].
     */
    private function colorRules(): array
    {
        return [
            'colors' => 'nullable|json',
            'variants' => 'nullable|json',
            'color_images' => 'nullable|array',
            'color_images.*' => 'array',
            'color_images.*.*' => 'image|mimes:jpeg,png,jpg,webp|max:4096',
        ];
    }

    /**
     * Replace the product's colours with the submitted list.
     *
     * `colors`: [{ id?, name, name_kh?, hex?, images: { front: url|null, ... } }]
     * Each image value is the URL to keep; a file in color_images[i][angle] replaces it.
     * Colours left out of the list are deleted along with their photos.
     */
    private function syncColors(Request $request, Product $product): void
    {
        if (!$request->has('colors')) {
            return;
        }

        $input = json_decode((string) $request->input('colors'), true);
        if (!is_array($input)) {
            return;
        }

        $existing = $product->colors()->get()->keyBy('id');
        $keptIds = [];
        $supabase = app(SupabaseStorageService::class);

        foreach (array_values($input) as $index => $row) {
            $name = is_array($row) ? trim((string) ($row['name'] ?? '')) : '';
            if ($name === '') {
                continue;
            }

            $color = isset($row['id']) ? $existing->get((int) $row['id']) : null;
            $oldImages = $color?->images ?? [];
            $sent = is_array($row['images'] ?? null) ? $row['images'] : [];
            $images = [];

            foreach (ProductColor::ANGLES as $angle) {
                $old = $oldImages[$angle] ?? null;
                $file = $request->file("color_images.$index.$angle");

                if ($file) {
                    $images[$angle] = $supabase->upload($file, 'products/colors');
                } else {
                    // Only keep a URL this colour already had; anything else is dropped
                    $keep = $sent[$angle] ?? null;
                    $images[$angle] = is_string($keep) && $keep === $old ? $old : null;
                }

                if ($old && $images[$angle] !== $old) {
                    $this->deleteImages([$old]);
                }
            }

            $hex = $row['hex'] ?? null;
            $attributes = [
                'name' => mb_substr($name, 0, 50),
                'name_kh' => isset($row['name_kh']) && trim((string) $row['name_kh']) !== '' ? mb_substr(trim($row['name_kh']), 0, 50) : null,
                'hex' => is_string($hex) && preg_match('/^#[0-9a-fA-F]{6}$/', $hex) ? strtolower($hex) : null,
                'images' => $images,
                'sort_order' => $index,
            ];

            if ($color) {
                $color->update($attributes);
            } else {
                $color = $product->colors()->create($attributes);
            }
            $keptIds[] = $color->id;
        }

        foreach ($existing as $id => $color) {
            if (!in_array($id, $keptIds, true)) {
                $this->deleteImages($color->imageUrls());
                $color->delete();
            }
        }

        // Bust the storefront caches even when only colours changed
        $product->touch();
    }

    /**
     * Read and check the `variants` JSON (memory options) before anything is saved.
     * Returns null when the form didn't send the field (leave options untouched),
     * or the cleaned rows ([] removes all options).
     *
     * Row: { id?, ram?, storage?, price, original_price?, stock, is_active? }
     *
     * @throws ValidationException
     */
    private function parseVariants(Request $request): ?array
    {
        if (!$request->has('variants')) {
            return null;
        }

        $input = json_decode((string) $request->input('variants'), true);
        if (!is_array($input)) {
            throw ValidationException::withMessages(['variants' => 'Memory options could not be read.']);
        }

        $rows = [];
        $seen = [];
        foreach (array_values($input) as $i => $row) {
            $n = $i + 1;
            $ram = is_array($row) ? trim((string) ($row['ram'] ?? '')) : '';
            $storage = is_array($row) ? trim((string) ($row['storage'] ?? '')) : '';

            if ($ram === '' && $storage === '') {
                throw ValidationException::withMessages(['variants' => "Memory option {$n} needs a RAM or storage value."]);
            }
            if (mb_strlen($ram) > 20 || mb_strlen($storage) > 20) {
                throw ValidationException::withMessages(['variants' => "Memory option {$n}: values must be 20 characters or less."]);
            }

            $key = mb_strtolower($ram . '|' . $storage);
            if (isset($seen[$key])) {
                throw ValidationException::withMessages(['variants' => "Memory option {$n} is listed twice."]);
            }
            $seen[$key] = true;

            $price = $row['price'] ?? null;
            if (!is_numeric($price) || (float) $price < 0) {
                throw ValidationException::withMessages(['variants' => "Memory option {$n} needs a price."]);
            }

            $stock = $row['stock'] ?? 0;
            if (!is_numeric($stock) || (int) $stock < 0 || (float) $stock != (int) $stock) {
                throw ValidationException::withMessages(['variants' => "Memory option {$n} needs a whole-number stock of 0 or more."]);
            }

            $original = $row['original_price'] ?? null;
            $original = is_numeric($original) && (float) $original > (float) $price ? round((float) $original, 2) : null;

            $rows[] = [
                'id' => isset($row['id']) && is_numeric($row['id']) ? (int) $row['id'] : null,
                'ram' => $ram !== '' ? $ram : null,
                'storage' => $storage !== '' ? $storage : null,
                'price' => round((float) $price, 2),
                'original_price' => $original,
                'stock' => (int) $stock,
                'is_active' => filter_var($row['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
                'sort_order' => $i,
            ];
        }

        return $rows;
    }

    /**
     * Replace the product's memory options with the checked rows, then refresh the
     * product's summary price/stock. Options left out are deleted (past orders keep their label).
     */
    private function saveVariants(Product $product, ?array $rows): void
    {
        if ($rows === null) {
            return;
        }

        DB::transaction(function () use ($product, $rows) {
            $existing = $product->variants()->get()->keyBy('id');
            $keptIds = [];

            foreach ($rows as $row) {
                $id = $row['id'];
                unset($row['id']);

                $variant = $id ? $existing->get($id) : null;
                if ($variant) {
                    $variant->update($row);
                } else {
                    $variant = $product->variants()->create($row);
                }
                $keptIds[] = $variant->id;
            }

            $product->variants()->whereNotIn('id', $keptIds ?: [0])->delete();
            $product->syncFromVariants();
        });
    }

    /**
     * Remove uploaded files from storage; failures are logged, never fatal.
     */
    private function deleteImages(array $urls): void
    {
        $supabase = app(SupabaseStorageService::class);
        foreach ($urls as $url) {
            if (is_string($url) && str_starts_with($url, 'http')) {
                try {
                    $supabase->delete($url);
                } catch (\Exception $e) {
                    Log::error('Failed to delete product image from Supabase: ' . $e->getMessage());
                }
            }
        }
    }
}
