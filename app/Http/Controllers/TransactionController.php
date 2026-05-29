<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function __construct(private TransactionService $transactionService) {}

    public function index(Request $request)
    {
        $transactions = Transaction::with(['user', 'items'])
            ->when($request->get('start_date'), fn($q, $date) => $q->whereDate('created_at', '>=', $date))
            ->when($request->get('end_date'), fn($q, $date) => $q->whereDate('created_at', '<=', $date))
            ->when($request->get('status'), fn($q, $status) => $q->where('status', $status))
            ->when($request->get('invoice_number'), fn($q, $invoice) => $q->where('invoice_number', 'like', "%$invoice%"))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'filters' => $request->only(['start_date', 'end_date', 'status', 'invoice_number']),
        ]);
    }

    public function show(Transaction $transaction)
    {
        $transaction->load(['user', 'items']);

        return Inertia::render('Transactions/Show', [
            'transaction' => $transaction,
        ]);
    }

    public function cancel(Transaction $transaction)
    {
        if ($transaction->isCancelled()) {
            return redirect()->back()->with('error', 'Transaksi sudah dibatalkan.');
        }

        $this->transactionService->cancel($transaction);

        return redirect()->back()->with('success', 'Transaksi berhasil dibatalkan.');
    }
}