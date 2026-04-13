<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'price',
        'stock',
        'category_id',
        'images',
        'attributes',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
        // 'images' is handled by getImagesAttribute accessor
        'attributes' => 'array',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted()
    {
        static::saved(function ($product) {
            static::clearProductCaches($product);
        });

        static::deleted(function ($product) {
            static::clearProductCaches($product);
        });
    }

    /**
     * Clear all product-related caches when a product changes.
     */
    private static function clearProductCaches($product): void
    {
        // Clear landing sections and categories
        Cache::forget('landing_sections_index');
        Cache::forget('categories_index');

        // Clear featured products cache
        Cache::forget('products_featured');

        // Clear the specific product detail cache by slug
        if ($product->slug) {
            Cache::forget('product_show_' . $product->slug);
        }

        // Increment the product cache version to bust all listing caches
        // The ProductController reads this version and includes it in cache keys
        Cache::increment('products_cache_version');
    }

    /**
     * Get the category that owns the product.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the product images, filtering out any invalid/corrupted entries.
     * Ensures only valid URL strings are returned.
     *
     * @param mixed $value
     * @return array
     */
    public function getImagesAttribute($value): array
    {
        // Decode if string (shouldn't be needed with cast, but safety check)
        $images = is_string($value) ? (json_decode($value, true) ?? []) : $value;

        if (!is_array($images)) {
            return [];
        }

        // Filter to only keep valid strings (can be full URL or local path)
        return array_values(array_filter($images, function ($img) {
            return is_string($img) && !empty(trim($img));
        }));
    }
}
