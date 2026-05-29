<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Transaction;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(private ReportService $reportService) {}

    public function index(Request $request)
    {
        $date = $request->get('date', now()->format('Y-m-d'));
        $summary = $this->reportService->getDailySummary($date);
        $recentTransactions = $this->reportService->getDailySales($date)->take(5);
        $lowStockProducts = $this->reportService->getLowStockProducts()->take(5);
        $topProducts = $this->reportService->getTopProducts(5);

        return Inertia::render('Dashboard/Index', [
            'summary' => $summary,
            'recentTransactions' => $recentTransactions,
            'lowStockProducts' => $lowStockProducts,
            'topProducts' => $topProducts,
            'selectedDate' => $date,
        ]);
    }
}