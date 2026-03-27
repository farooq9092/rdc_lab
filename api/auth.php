<?php
require_once 'config.php';

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'login') {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['admin_auth'] = true;
        $_SESSION['username'] = $user['username'];
        session_write_close(); // Force save session
        sendJSON(['message' => 'Login Successful']);
    } else {
        sendJSON(['error' => 'Invalid credentials'], 401);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'logout') {
    session_destroy();
    sendJSON(['message' => 'Logged out']);
}
?>
