<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'transaction_id',
        'product_id',
        'product_name',
        'product_price',
        'quantity',
        'discount_percent',
        'subtotal',
        'is_ready',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'product_price' => 'decimal:2',
        'quantity' => 'integer',
        'discount_percent' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'is_ready' => 'boolean',
    ];

    /**
     * Get the transaction that owns the item.
     */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * Get the product associated with the item.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the total for this item (after discount).
     */
    public function getTotalAttribute(): float
    {
        return $this->subtotal;
    }

    /**
     * Get the discount amount for this item.
     */
    public function getDiscountAmountAttribute(): float
    {
        return ($this->product_price * $this->quantity * $this->discount_percent) / 100;
    }
}