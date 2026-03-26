<?php
require_once 'config.php';

$action = $_GET['action'] ?? '';

// List approved feedback for public
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'list') {
    $stmt = $pdo->query("SELECT * FROM feedback WHERE status = 'Approved' ORDER BY created_at DESC");
    echo json_encode($stmt->fetchAll());
    exit;
}

// Admin - List all feedback
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'listAll') {
    adminOnly();
    $stmt = $pdo->query("SELECT * FROM feedback ORDER BY created_at DESC");
    echo json_encode($stmt->fetchAll());
    exit;
}

// Submit new feedback
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'submit') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("INSERT INTO feedback (name, comment, rating, status) VALUES (?, ?, ?, 'Pending')");
    $stmt->execute([$data['name'], $data['comment'], $data['rating']]);
    echo json_encode(['message' => 'Thank you! Your review is pending approval.']);
    exit;
}

// Admin - Update status (Approve/Hide)
if ($_SERVER['REQUEST_METHOD'] === 'PUT' && $action === 'status') {
    adminOnly();
    $id = $_GET['id'] ?? '';
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("UPDATE feedback SET status = ? WHERE id = ?");
    $stmt->execute([$data['status'], $id]);
    echo json_encode(['message' => 'Status updated']);
    exit;
}

// Admin - Delete
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $action === 'delete') {
    adminOnly();
    $id = $_GET['id'] ?? '';
    $stmt = $pdo->prepare("DELETE FROM feedback WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['message' => 'Deleted']);
    exit;
}
?>
