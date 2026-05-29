<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Enums\FulfillmentStatus;
use App\Enums\TransactionStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KitchenController extends Controller
{
    /**
     * Display a listing of active orders for the kitchen.
     */
    public function index()
    {
        // Get transactions that are completed (paid) for today
        $transactions = Transaction::with('items')
            ->where('status', TransactionStatus::COMPLETED)
            ->whereDate('created_at', today())
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('Kitchen/Index', [
            'transactions' => $transactions
        ]);
    }

    public function updateStatus(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'status' => ['required', \Illuminate\Validation\Rule::enum(FulfillmentStatus::class)]
        ]);

        $transaction->update([
            'fulfillment_status' => $validated['status']
        ]);

        // If status is ready, mark all items as ready
        if ($validated['status'] === 'ready') {
            $transaction->items()->update(['is_ready' => true]);
        }

        return redirect()->back()->with('success', 'Status pesanan diperbarui.');
    }

    /**
     * Update the readiness of specific items within a transaction.
     */
    public function updateItems(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'item_ids' => 'required|array',
            'item_ids.*' => 'integer|exists:transaction_items,id',
            'is_ready' => 'required|boolean'
        ]);

        $transaction->items()->whereIn('id', $validated['item_ids'])->update([
            'is_ready' => $validated['is_ready']
        ]);

        // Check if all items are now ready
        $allReady = $transaction->items()->where('is_ready', false)->doesntExist();
        if ($allReady && $transaction->fulfillment_status !== 'ready') {
            $transaction->update(['fulfillment_status' => 'ready']);
        }

        return redirect()->back()->with('success', 'Status item diperbarui.');
    }
}
