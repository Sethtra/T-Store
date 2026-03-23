<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'quantity_change',
        'type',
        'reference',
        'notes',
        'created_by',
    ];

    /**
     * Get the product that the movement belongs to.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the user who created the movement (admin).
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
