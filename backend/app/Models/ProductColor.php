<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductColor extends Model
{
    /** The six fixed photo positions, in display order. */
    public const ANGLES = ['front', 'rear', 'left', 'right', 'top', 'bottom'];

    protected $fillable = [
        'product_id',
        'name',
        'name_kh',
        'hex',
        'images',
        'sort_order',
    ];

    protected $casts = [
        'images' => 'array',
        'sort_order' => 'integer',
    ];

    protected $hidden = ['created_at', 'updated_at'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** Every stored image URL for this colour. */
    public function imageUrls(): array
    {
        return array_values(array_filter($this->images ?? [], fn ($url) => is_string($url) && $url !== ''));
    }
}
