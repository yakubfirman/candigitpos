<?php

namespace App\Services;

use App\Enums\TransactionStatus;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TransactionService
{
    /**
     * Create a new transaction.
     *
     * @param array<string, mixed> $data
     */
    public function create(array $data, User $cashier): Transaction
    {
        return DB::transaction(function () use ($data, $cashier) {
            // Create the transaction
            $transaction = Transaction::create([
                'user_id' => $cashier->id,
                'invoice_number' => $this->generateInvoice(),
                'subtotal' => $data['subtotal'],
                'discount_amount' => $data['discount_amount'] ?? 0,
                'tax_amount' => $data['tax_amount'] ?? 0,
                'total' => $data['total'],
                'payment_method' => $data['payment_method'],
                'amount_paid' => $data['amount_paid'],
                'change_amount' => ($data['amount_paid'] ?? 0) - $data['total'],
                'status' => TransactionStatus::COMPLETED,
                'customer_name' => $data['customer_name'] ?? null,
                'table_number' => $data['table_number'] ?? null,
                'order_type' => $data['order_type'] ?? 'dine_in',
                'notes' => $data['notes'] ?? null,
            ]);

            // Create items and decrement stock
            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                $transaction->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name, // snapshot
                    'product_price' => $product->price, // snapshot
                    'quantity' => $item['quantity'],
                    'discount_percent' => $item['discount_percent'] ?? 0,
                    'subtotal' => $item['subtotal'],
                ]);

                // Decrement stock
                $product->decrement('stock', $item['quantity']);
            }

            return $transaction;
        });
    }

    /**
     * Cancel a transaction and restore stock.
     */
    public function cancel(Transaction $transaction): Transaction
    {
        return DB::transaction(function () use ($transaction) {
            // Restore stock for each item
            foreach ($transaction->items as $item) {
                $product = Product::findOrFail($item->product_id);
                $product->increment('stock', $item->quantity);
            }

            // Update transaction status
            $transaction->update([
                'status' => TransactionStatus::CANCELLED,
            ]);

            return $transaction->fresh(['items', 'user']);
        });
    }

    /**
     * Generate a unique invoice number.
     */
    private function generateInvoice(): string
    {
        $date = now()->format('Ymd');
        $lastTransaction = Transaction::whereDate('created_at', today())
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