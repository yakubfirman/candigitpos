<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\TransactionStatus;
use App\Enums\FulfillmentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'invoice_number',
        'subtotal',
        'discount_amount',
        'tax_amount',
        'total',
        'payment_method',
        'amount_paid',
        'change_amount',
        'status',
        'fulfillment_status',
        'customer_name',
        'table_number',
        'notes',
        'order_type',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'change_amount' => 'decimal:2',
        'payment_method' => PaymentMethod::class,
        'status' => TransactionStatus::class,
        'fulfillment_status' => FulfillmentStatus::class,
    ];

    /**
     * Get the user that owns the transaction.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the items for the transaction.
     */
    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }

    /**
     * Check if the transaction is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === TransactionStatus::COMPLETED;
    }

    /**
     * Check if the transaction is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === TransactionStatus::CANCELLED;
    }

    /**
     * Scope a query to only include completed transactions.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', TransactionStatus::COMPLETED);
    }

    /**
     * Scope a query to only include cancelled transactions.
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', TransactionStatus::CANCELLED);
    }

    /**
     * Get the total items count.
     */
    public function getTotalItemsAttribute(): int
    {
        return $this->items->sum('quantity');
    }

    /**
     * Generate a unique invoice number.
     */
    public static function generateInvoiceNumber(): string
    {
        $date = now()->format('Ymd');
        $lastTransaction = self::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();

        $sequence = 1;
        if ($lastTransaction) {
            preg_match('/-(\d{3})$/', $lastTransaction->invoice_number, $matches);
            $sequence = isset($matches[1]) ? (int)$matches[1] + 1 : 1;
        }

        return 'INV-' . $date . '-' . str_pad($sequence, 3, '0', STR_PAD_LEFT);
    }
}