<?php
require_once 'config.php';

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'create') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("INSERT INTO bookings (patient_name, phone, package, address) VALUES (?, ?, ?, ?)");
    $stmt->execute([$data['name'], $data['phone'], $data['package'], $data['address']]);
    
    sendJSON(['message' => 'Booking received successfully!']);
}

// Admin Operations
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'list') {
    adminOnly();
    $stmt = $pdo->query("SELECT * FROM bookings ORDER BY created_at DESC");
    sendJSON($stmt->fetchAll());
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT' && $action === 'status') {
    adminOnly();
    $bid = $_GET['id'] ?? 0;
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("UPDATE bookings SET status = ? WHERE id = ?");
    $stmt->execute([$data['status'], $bid]);
    sendJSON(['message' => 'Status updated']);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $action === 'delete') {
    adminOnly();
    $bid = $_GET['id'] ?? 0;
    $stmt = $pdo->prepare("DELETE FROM bookings WHERE id = ?");
    $stmt->execute([$bid]);
    sendJSON(['message' => 'Booking deleted']);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $action === 'deleteAll') {
    adminOnly();
    $pdo->query("DELETE FROM bookings");
    sendJSON(['message' => 'All bookings deleted']);
}
?>
