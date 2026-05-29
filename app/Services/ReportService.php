<?php

namespace App\Services;

use App\Enums\TransactionStatus;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * Get daily sales for a specific date.
     *
     * @param string|null $date Format: Y-m-d
     */
    public function getDailySales(?string $date = null): Collection
    {
        $date = $date ?? now()->format('Y-m-d');

        return Transaction::with(['user', 'items'])
            ->whereDate('created_at', $date)
            ->where('status', TransactionStatus::COMPLETED)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get daily sales summary.
     *
     * @param string|null $date Format: Y-m-d
     */
    public function getDailySummary(?string $date = null): array
    {
        $date = $date ?? now()->format('Y-m-d');

        $transactions = Transaction::whereDate('created_at', $date)
            ->where('status', TransactionStatus::COMPLETED);

        return [
            'total_transactions' => $transactions->count(),
            'total_revenue' => $transactions->sum('total'),
            'total_items_sold' => DB::table('transaction_items')
                ->whereIn('transaction_id', function ($query) use ($date) {
                    $query->select('id')
                        ->from('transactions')
                        ->whereDate('created_at', $date)
                        ->where('status', TransactionStatus::COMPLETED);
                })
                ->sum('quantity'),
            'average_transaction' => $transactions->avg('total') ?? 0,
        ];
    }

    /**
     * Get sales by period.
     *
     * @param string $startDate Format: Y-m-d
     * @param string $endDate Format: Y-m-d
     */
    public function getSalesByPeriod(string $startDate, string $endDate): Collection
    {
        $start = \Carbon\Carbon::parse($startDate)->startOfDay();
        $end = \Carbon\Carbon::parse($endDate)->endOfDay();

        return Transaction::with(['user', 'items'])
            ->whereBetween('created_at', [$start, $end])
            ->where('status', TransactionStatus::COMPLETED)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get period summary.
     *
     * @param string $startDate Format: Y-m-d
     * @param string $endDate Format: Y-m-d
     */
    public function getPeriodSummary(string $startDate, string $endDate): array
    {
        $start = \Carbon\Carbon::parse($startDate)->startOfDay();
        $end = \Carbon\Carbon::parse($endDate)->endOfDay();

        $transactions = Transaction::whereBetween('created_at', [$start, $end])
            ->where('status', TransactionStatus::COMPLETED);

        $transactionIds = Transaction::whereBetween('created_at', [$start, $end])
            ->where('status', TransactionStatus::COMPLETED)
            ->pluck('id');

        $totalRevenue = $transactions->sum('total');
        $totalItemsSold = DB::table('transaction_items')
            ->whereIn('transaction_id', $transactionIds)
            ->sum('quantity');

        return [
            'total_transactions' => $transactions->count(),
            'total_revenue' => $totalRevenue,
            'total_items_sold' => $totalItemsSold,
            'average_transaction' => $transactions->avg('total') ?? 0,
        ];
    }

    /**
     * Get top selling products.
     *
     * @param int $limit
     * @param string|null $startDate Format: Y-m-d
     * @param string|null $endDate Format: Y-m-d
     */
    public function getTopProducts(int $limit = 10, ?string $startDate = null, ?string $endDate = null): Collection
    {
        $start = $startDate ? \Carbon\Carbon::parse($startDate)->startOfDay() : null;
        $end = $endDate ? \Carbon\Carbon::parse($endDate)->endOfDay() : null;

        $query = TransactionItem::select('product_id', 'product_name', DB::raw('SUM(quantity) as total_quantity'), DB::raw('SUM(subtotal) as total_revenue'))
            ->whereHas('transaction', function ($q) use ($start, $end) {
                $q->where('status', TransactionStatus::COMPLETED);
                if ($start && $end) {
                    $q->whereBetween('created_at', [$start, $end]);
                }
            })
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('total_quantity');

        if ($start && $end) {
            $query->whereHas('transaction', function ($q) use ($start, $end) {
                $q->whereBetween('created_at', [$start, $end]);
            });
        }

        return $query->limit($limit)->get();
    }

    /**
     * Get products with low stock.
     */
    public function getLowStockProducts(): Collection
    {
        return Product::with('category')
            ->lowStock()
            ->orderBy('stock', 'asc')
            ->get();
    }

    /**
     * Get sales by payment method.
     *
     * @param string|null $startDate Format: Y-m-d
     * @param string|null $endDate Format: Y-m-d
     */
    public function getSalesByPaymentMethod(?string $startDate = null, ?string $endDate = null): array
    {
        $start = $startDate ? \Carbon\Carbon::parse($startDate)->startOfDay() : null;
        $end = $endDate ? \Carbon\Carbon::parse($endDate)->endOfDay() : null;

        $query = Transaction::where('status', TransactionStatus::COMPLETED);

        if ($start && $end) {
            $query->whereBetween('created_at', [$start, $end]);
        }

        $transactions = $query->get();

        $byMethod = [];
        foreach ($transactions->groupBy('payment_method') as $method => $group) {
            $byMethod[$method] = [
                'count' => $group->count(),
                'total' => $group->sum('total'),
            ];
        }

        return $byMethod;
    }

    /**
     * Get monthly comparison data.
     *
     * @param int $months Number of months to compare
     */
    public function getMonthlyComparison(int $months = 6): array
    {
        $data = [];
        $currentDate = now();

        for ($i = $months - 1; $i >= 0; $i--) {
            $monthStart = $currentDate->copy()->subMonths($i)->startOfMonth();
            $monthEnd = $currentDate->copy()->subMonths($i)->endOfMonth();

            $transactions = Transaction::where('status', TransactionStatus::COMPLETED)
                ->whereBetween('created_at', [$monthStart, $monthEnd]);

            $data[] = [
                'month' => $monthStart->format('M Y'),
                'total_transactions' => $transactions->count(),
                'total_revenue' => $transactions->sum('total'),
            ];
        }

        return $data;
    }
}