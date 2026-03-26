<?php
require_once 'config.php';

$action = $_GET['action'] ?? '';

// Fetch all gallery items
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'list') {
    $stmt = $pdo->query("SELECT * FROM gallery ORDER BY id DESC");
    echo json_encode($stmt->fetchAll());
    exit;
}

// Upload new gallery image
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'upload') {
    adminOnly();
    
    $title = $_POST['title'] ?? 'Lab Event';
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'No image uploaded']);
        exit;
    }

    $file = $_FILES['image'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'webp'];

    if (!in_array($ext, $allowed)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid image type']);
        exit;
    }

    $uploadDir = '../uploads/gallery/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

    $safeName = 'gal_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $targetPath = $uploadDir . $safeName;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        $stmt = $pdo->prepare("INSERT INTO gallery (url, title) VALUES (?, ?)");
        $stmt->execute(['uploads/gallery/' . $safeName, $title]);
        echo json_encode(['message' => 'Success']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save image']);
    }
    exit;
}

// Delete image
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $action === 'delete') {
    adminOnly();
    $id = $_GET['id'] ?? '';
    
    // Fetch path to delete file
    $stmt = $pdo->prepare("SELECT url FROM gallery WHERE id = ?");
    $stmt->execute([$id]);
    $item = $stmt->fetch();
    
    if ($item) {
        $fullPath = '../' . $item['url'];
        if (file_exists($fullPath)) unlink($fullPath);
        
        $stmt = $pdo->prepare("DELETE FROM gallery WHERE id = ?");
        $stmt->execute([$id]);
    }
    echo json_encode(['message' => 'Deleted']);
    exit;
}
?>
