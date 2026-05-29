<?php
$pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=possystemfix', 'root', '');
$stmt = $pdo->query("SHOW COLUMNS FROM transactions");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
$found = false;
foreach ($columns as $col) {
    if ($col['Field'] === 'customer_name') {
        $found = true;
    }
}
echo $found ? "HAS_COLUMN" : "MISSING_COLUMN";
