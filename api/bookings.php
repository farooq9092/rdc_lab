<?php
require_once 'config.php';

$action = $_GET['action'] ?? '';

// Public - Submit Booking
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'submit') {
    $data = json_decode(file_get_contents('php://input'), true);
    $name = $data['name'] ?? '';
    $phone = $data['phone'] ?? '';
    $package = $data['package'] ?? 'General Inquiry';
    $address = $data['address'] ?? '';

    if (!$name || !$phone) {
        sendJSON(['error' => 'Name and Phone are required'], 400);
    }

    $stmt = $pdo->prepare("INSERT INTO bookings (name, phone, package, address) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $phone, $package, $address]);

    sendJSON(['message' => 'Appointment request submitted successfully']);
}

// Admin - List Bookings
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'list') {
    adminOnly();
    $stmt = $pdo->query("SELECT * FROM bookings ORDER BY created_at DESC");
    sendJSON($stmt->fetchAll());
}

// Admin - Delete Booking
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $action === 'delete') {
    adminOnly();
    $id = $_GET['id'] ?? '';
    $stmt = $pdo->prepare("DELETE FROM bookings WHERE id = ?");
    $stmt->execute([$id]);
    sendJSON(['message' => 'Booking deleted']);
}

// Admin - Delete All
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $action === 'deleteAll') {
    adminOnly();
    $pdo->query("DELETE FROM bookings");
    sendJSON(['message' => 'All bookings cleared']);
}
?>
