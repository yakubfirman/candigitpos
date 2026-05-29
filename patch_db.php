<?php
try {
    $db = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Increase timeout to wait for lock
    $db->exec("PRAGMA busy_timeout = 5000");
    
    $result = $db->query("PRAGMA table_info(transaction_items)");
    $columns = $result->fetchAll(PDO::FETCH_ASSOC);
    
    $hasIsReady = false;
    foreach ($columns as $column) {
        if ($column['name'] === 'is_ready') {
            $hasIsReady = true;
            break;
        }
    }
    
    if (!$hasIsReady) {
        $db->exec("ALTER TABLE transaction_items ADD COLUMN is_ready BOOLEAN NOT NULL DEFAULT 0");
        file_put_contents(__DIR__ . '/patch_result.txt', "Column 'is_ready' added successfully.\n");
    } else {
        file_put_contents(__DIR__ . '/patch_result.txt', "Column 'is_ready' already exists.\n");
    }
} catch (Exception $e) {
    file_put_contents(__DIR__ . '/patch_result.txt', "Error: " . $e->getMessage() . "\n");
}
