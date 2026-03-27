<?php
// 1. Force Error Display for Debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 2. Initialize Session at the absolute top
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_samesite', 'Lax');
    if (isset($_SERVER['SERVER_NAME'])) {
        ini_set('session.cookie_domain', $_SERVER['SERVER_NAME']);
    }
    session_start();
}

// 3. Database configuration (Hostinger)
$host = 'localhost';
$db = 'u932844992_rdc'; 
$user = 'u932844992_rdclab'; 
$pass = 'farooq@Domain1'; 
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
}
catch (\PDOException $e) {
    header("HTTP/1.1 500 Internal Server Error");
    echo json_encode(['error' => 'DB Connection Failed: ' . $e->getMessage()]);
    exit;
}

// Utility function for JSON responses
function sendJSON($data, $status = 200)
{
    if (!headers_sent()) {
        http_response_code($status);
        header('Content-Type: application/json');
    }
    echo json_encode($data);
    exit;
}

function isAdmin()
{
    return isset($_SESSION['admin_auth']) && $_SESSION['admin_auth'] === true;
}

function adminOnly()
{
    if (!isAdmin()) {
        sendJSON(['error' => 'Unauthorized'], 401);
    }
}
?>
