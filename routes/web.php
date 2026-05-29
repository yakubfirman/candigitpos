<?php

use App\Http\Controllers\{
    DashboardController,
    ProductController,
    CategoryController,
    TransactionController,
    ReportController,
    SettingController,
    POSController,
    UserController,
    KitchenController,
};
use Illuminate\Support\Facades\Route;

// Auth routes
require __DIR__.'/auth.php';

// Public routes (if any)
Route::get('/up', function () {
    return response()->json(['status' => 'ok']);
});

Route::middleware(['auth'])->group(function () {
    // Protected routes
    Route::get('/', function () {
        $role = auth()->user()->role;
        $roleValue = is_object($role) ? $role->value : $role;
        if ($roleValue === 'dapur') {
            return redirect()->route('kitchen.index');
        }
        if ($roleValue === 'super_admin') {
            return redirect()->route('settings.index');
        }
        return redirect()->route('dashboard');
    });

    // Routes only for Admin and Kasir
    Route::middleware('role:admin,kasir')->group(function () {
        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // POS - Main cashier page
        Route::middleware('feature:feature_pos')->group(function () {
            Route::get('/pos', [POSController::class, 'index'])->name('pos.index');
            Route::post('/pos/transaction', [POSController::class, 'store'])->name('pos.store');
        });

        // Products (read-only for kasir)
        Route::middleware('feature:feature_products')->group(function () {
            Route::get('products', [ProductController::class, 'index'])->name('products.index');
        });

        // Categories (read-only for kasir)
        Route::middleware('feature:feature_categories')->group(function () {
            Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
        });

        // Transactions (read-only for kasir, full for admin)
        Route::middleware('feature:feature_transactions')->group(function () {
            Route::resource('transactions', TransactionController::class)->only(['index', 'show']);
        });
    });

    // Kitchen (Admin & Dapur) - guarded by feature toggle
    Route::middleware(['role:admin,dapur', 'feature:feature_kitchen'])->group(function () {
        Route::get('/kitchen', [KitchenController::class, 'index'])->name('kitchen.index');
        Route::patch('/kitchen/{transaction}/status', [KitchenController::class, 'updateStatus'])->name('kitchen.status');
        Route::patch('/kitchen/{transaction}/items', [KitchenController::class, 'updateItems'])->name('kitchen.items');
    });

    // Admin only routes
    Route::middleware('role:admin')->group(function () {
        // Products (CUD)
        Route::middleware('feature:feature_products')->group(function () {
            Route::resource('products', ProductController::class)->except(['index', 'show']);
        });
        
        // Categories (CUD)
        Route::middleware('feature:feature_categories')->group(function () {
            Route::resource('categories', CategoryController::class)->except(['index', 'show']);
        });

        // Cancel transaction
        Route::middleware('feature:feature_transactions')->group(function () {
            Route::patch('/transactions/{transaction}/cancel', [TransactionController::class, 'cancel'])
                ->name('transactions.cancel');
        });

        // Reports - guarded by feature toggle
        Route::middleware('feature:feature_reports')->group(function () {
            Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
            Route::get('/reports/export', [ReportController::class, 'export'])->name('reports.export');
        });

        // Settings
        Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
        Route::patch('/settings', [SettingController::class, 'update'])->name('settings.update');
        Route::patch('/settings/features', [SettingController::class, 'updateFeatures'])->name('settings.features');

        // Users - guarded by feature toggle
        Route::middleware('feature:feature_users_management')->group(function () {
            Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);
        });
    });
});