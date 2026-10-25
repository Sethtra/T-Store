<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One memory option of a product (RAM and/or storage) with its own price and stock.
 */
class ProductVariant extends Model
{
    protected $fillable = [
        'product_id',
        'ram',
        'storage',
        'price',
        'original_price',
        'stock',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'original_price' => 'decimal:2',
        'stock' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $hidden = ['created_at', 'updated_at'];

    protected $appends = ['label'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * The Supabase transaction pooler needs emulated prepares, which send PHP
     * booleans as 1/0; Postgres rejects that for a boolean column. Store a
     * literal 'true'/'false' there (other databases keep 1/0).
     */
    public function setIsActiveAttribute($value): void
    {
        $on = filter_var($value, FILTER_VALIDATE_BOOLEAN);
        $this->attributes['is_active'] = $this->getConnection()->getDriverName() === 'pgsql'
            ? ($on ? 'true' : 'false')
            : ($on ? 1 : 0);
    }

    /**
     * Read back whatever form the value is in (true, 1, 't', 'true', 'false'…);
     * a plain (bool) cast would turn the string 'false' into true.
     */
    public function getIsActiveAttribute($value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        return in_array(strtolower(trim((string) $value)), ['1', 't', 'true', 'on', 'yes'], true);
    }

    /** "12GB / 256GB", or whichever half is set. */
    public function getLabelAttribute(): string
    {
        return implode(' / ', array_filter([$this->ram, $this->storage]));
    }
}
