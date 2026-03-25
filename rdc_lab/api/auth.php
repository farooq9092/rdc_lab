<?php
require_once 'config.php';
session_start();

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($action === 'login') {
        $data = json_decode(file_get_contents('php://input'), true);
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';

        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['admin_logged_in'] = True;
            sendJSON(['status' => 'success']);
        } else {
            sendJSON(['error' => 'Invalid credentials'], 401);
        }
    }

    if ($action === 'logout') {
        session_destroy();
        sendJSON(['status' => 'logged out']);
    }
}
?>
