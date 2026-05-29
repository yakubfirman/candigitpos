<?php
$pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=possystemfix', 'root', '');
$stmt = $pdo->query('SHOW PROCESSLIST');
$processes = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($processes as $p) {
    if ($p['Time'] > 10 && $p['Id'] != $pdo->query('SELECT CONNECTION_ID()')->fetchColumn()) {
        echo "Killing process {$p['Id']}\n";
        $pdo->exec("KILL {$p['Id']}");
    }
}
echo "Done killing processes.\n";
