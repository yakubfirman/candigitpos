<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$migrations = DB::table('migrations')->get();
foreach($migrations as $m) {
    echo $m->migration . "\n";
}

try {
    DB::statement('ALTER TABLE transactions ADD COLUMN customer_name VARCHAR(255) NULL AFTER status, ADD COLUMN table_number VARCHAR(50) NULL AFTER customer_name');
    echo "Columns added successfully!\n";
} catch (\Exception $e) {
    echo "Error adding columns: " . $e->getMessage() . "\n";
}
