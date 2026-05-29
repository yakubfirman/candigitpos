<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Models\Transaction;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class POSController extends Controller
{
    public function __construct(private TransactionService $transactionService) {}

    public function index()
    {
        $products = \App\Models\Product::with('category')
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->orderBy('name')
            ->get();

        $categories = \App\Models\Category::orderBy('name')->get();

        return Inertia::render('POS/Index', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    public function store(StoreTransactionRequest $request)
    {
        $transaction = $this->transactionService->create(
            $request->validated(),
            auth()->user()
        );

        return back()->with([
            'success' => 'Transaksi berhasil.',
            'transaction' => $transaction->load('items'),
        ]);
    }
}