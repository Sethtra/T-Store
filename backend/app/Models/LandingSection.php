<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;

class LandingSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'section_type',
        'product_id',
        'title',
        'title_kh',
        'description',
        'description_kh',
        'image',
        'is_active',
        'order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    /**
     * Get the product associated with this landing section.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Scope to get only active sections.
     */
    public function scopeActive($query)
    {
        // Force raw boolean comparison for Postgres Transaction Pooler compatibility
        return $query->whereRaw('is_active = true');
    }

    /**
     * Scope to order by the order column.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order', 'asc');
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::saved(function () {
            Cache::forget('landing_sections_index');
        });

        static::deleted(function () {
            Cache::forget('landing_sections_index');
        });
    }
}
