<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
        $images = is_string($value) ? json_decode($value, true) : $value;

        if (!is_array($images)) {
            return [];
        }

        // Filter to only keep valid string URLs
        return array_values(array_filter($images, function ($img) {
            return is_string($img) && !empty($img) && filter_var($img, FILTER_VALIDATE_URL);
        }));
    }
}
