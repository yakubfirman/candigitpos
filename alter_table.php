<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    DB::statement("ALTER TABLE transactions ADD COLUMN order_type ENUM('dine_in', 'take_away') DEFAULT 'dine_in' AFTER table_number");
    echo "Column added successfully.\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
