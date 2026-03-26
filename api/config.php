<?php
// Database configuration
// Replace with your actual Hostinger HPanel details
$host = 'localhost';
$db   = 'u123456789_rdc'; // Your Database Name
$user = 'u123456789_rdclab'; // Your Database Username
$pass = 'admin@Domain1'; // Your Database Password
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERR_MODE            => PDO::ERR_MODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     // For production, you might want a more subtle error
     // die("Connection failed: " . $e->getMessage());
     header("HTTP/1.1 500 Internal Server Error");
     echo json_encode(['error' => 'Database connection failed. Please check api/config.php']);
     exit;
}

// Utility function for JSON responses
function sendJSON($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Admin Session Check
session_start();
function isAdmin() {
    return isset($_SESSION['admin_auth']) && $_SESSION['admin_auth'] === true;
}

function adminOnly() {
    if (!isAdmin()) {
        sendJSON(['error' => 'Unauthorized'], 401);
    }
}
?>
