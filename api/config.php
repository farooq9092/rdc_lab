<?php
// Database Configuration for Hostinger MySQL
// Fill these in with your actual Hostinger Database details

define('DB_HOST', 'localhost'); // Often localhost on Hostinger
define('DB_NAME', 'u932844992_rdc'); // Your Hostinger DB Name
define('DB_USER', 'u932844992_rdclab'); // Your Hostinger DB User
define('DB_PASS', 'farooq@Domain1'); // Your Hostinger DB Password

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}

// Security Helper
function sendJSON($data, $code = 200)
{
    header('Content-Type: application/json');
    http_response_code($code);
    echo json_encode($data);
    exit;
}

// Login Required Helper
function adminOnly()
{
    session_start();
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        sendJSON(['error' => 'Unauthorized Access'], 401);
    }
}
?>
