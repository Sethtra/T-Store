<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CategoryDisplay extends Model
{
    use HasFactory;

    protected $fillable = [
        'position',
        'category_id',
        'title',
        'title_kh',
        'description',
        'description_kh',
        'image_url',
        'button_text',
        'button_text_kh',
        'link',
        'is_active',
        'order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    /**
     * Get the category associated with this display.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Scope to get only active displays.
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
     * Get the display for a specific position.
     */
    public static function getByPosition(string $position)
    {
        return static::where('position', $position)->first();
    }
}
