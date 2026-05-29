<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=possystemfix', 'root', '');
$stmt = $pdo->query("SHOW COLUMNS FROM transactions LIKE 'order_type'");
$result = $stmt->fetch();
if ($result) {
    echo "Column exists!\n";
} else {
    echo "Column does NOT exist. Adding it...\n";
    $pdo->exec("ALTER TABLE transactions ADD order_type ENUM('dine_in', 'take_away') DEFAULT 'dine_in' AFTER table_number");
    echo "Done adding column.\n";
}
