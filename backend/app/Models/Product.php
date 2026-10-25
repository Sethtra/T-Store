<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'title_kh',
        'slug',
        'description',
        'description_kh',
        'price',
        'original_price',
        'stock',
        'category_id',
        'images',
        'attributes',
        'specs',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'original_price' => 'decimal:2',
        'stock' => 'integer',
        // 'images' is handled by getImagesAttribute accessor
        'attributes' => 'array',
        'specs' => 'array',
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
        // increment() does nothing when the key is missing (database cache store),
        // which left listings stale for up to an hour; start a fresh version instead.
        // A timestamp can't collide with versions already used in cached keys.
        if (Cache::increment('products_cache_version') === false) {
            Cache::forever('products_cache_version', time());
        }
    }

    /**
     * Get the category that owns the product.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Colour options, each with its own six-angle photo set.
     */
    public function colors(): HasMany
    {
        return $this->hasMany(ProductColor::class)->orderBy('sort_order')->orderBy('id');
    }

    /**
     * Memory options (RAM / storage), each with its own price and stock.
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->orderBy('sort_order')->orderBy('id');
    }

    /**
     * Options shoppers can buy (switched-off ones are hidden from the store).
     */
    public function activeVariants(): HasMany
    {
        // Raw boolean comparison for Postgres Transaction Pooler compatibility (same as Banner::scopeActive)
        return $this->variants()->whereRaw('is_active = true');
    }

    /**
     * For products with memory options, keep the product's own price and stock
     * as a summary (lowest price, total stock) so listings, sorting, stock alerts
     * and reports keep working unchanged. Products without options are left alone.
     */
    public function syncFromVariants(): void
    {
        $all = $this->variants()->get();
        if ($all->isEmpty()) {
            return;
        }

        // Every option switched off: nothing can be bought
        $active = $all->where('is_active', true);
        if ($active->isEmpty()) {
            $this->update(['stock' => 0]);
            return;
        }

        $cheapest = $active->sortBy(fn ($v) => (float) $v->price)->first();
        $original = $cheapest->original_price !== null && (float) $cheapest->original_price > (float) $cheapest->price
            ? $cheapest->original_price
            : null;

        $this->update([
            'price' => $cheapest->price,
            'original_price' => $original,
            'stock' => (int) $active->sum('stock'),
        ]);
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
