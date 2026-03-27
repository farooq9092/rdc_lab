<?php
require_once 'config.php';

$action = $_GET['action'] ?? '';

// Public - Fetch Report (Using 'cnic' parameter as Password for backend stability)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'fetch') {
    $case_id = $_GET['case_id'] ?? '';
    // The frontend sends 'password' but we'll read it from 'cnic' param if updated in script.js 
    // or just use 'cnic' for the internal variable.
    $password = $_GET['cnic'] ?? ''; 

    $stmt = $pdo->prepare("SELECT * FROM reports WHERE case_id = ?");
    $stmt->execute([$case_id]);
    $report = $stmt->fetch();

    if (!$report) {
        sendJSON(['error' => 'Report not found', 'type' => 'WRONG_ID'], 404);
    }
    if ($report['cnic'] !== $password) {
        sendJSON(['error' => 'Incorrect Password provided', 'type' => 'WRONG_PWD'], 403);
    }
    sendJSON($report);
}

// Public - Download Report
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'download') {
    $case_id = $_GET['case_id'] ?? '';
    // Use 'cnic' or 'password' parameter for maximum compatibility
    $password = $_GET['cnic'] ?? ($_GET['password'] ?? '');

    if (!$case_id || !$password) {
        die("Missing Case ID or Password.");
    }

    $stmt = $pdo->prepare("SELECT * FROM reports WHERE case_id = ? AND cnic = ?");
    $stmt->execute([$case_id, $password]);
    $report = $stmt->fetch();

    if (!$report) {
        die("Invalid Credentials. Please check Case ID and Password (CNIC).");
    }

    if (empty($report['file_path'])) {
        die("This report record does not have an attached file.");
    }

    $fullPath = '../' . $report['file_path'];
    
    if (file_exists($fullPath) && is_file($fullPath)) {
        $ext = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
        $filename = "Report_" . preg_replace("/[^a-zA-Z0-9]/", "_", $case_id) . "." . $ext;
        
        // Clear any previous output
        if (ob_get_level()) ob_end_clean();
        
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($fullPath));
        readfile($fullPath);
        exit;
    } else {
        die("Physical file not found on server at: " . $fullPath);
    }
}

// Admin - List Reports
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'list') {
    adminOnly();
    $date = $_GET['date'] ?? '';
    $month = $_GET['month'] ?? '';

    $sql = "SELECT * FROM reports WHERE 1=1";
    $params = [];

    if ($date) {
        $sql .= " AND DATE(created_at) = ?";
        $params[] = $date;
    } elseif ($month) {
        $sql .= " AND DATE_FORMAT(created_at, '%Y-%m') = ?";
        $params[] = $month;
    }
    $sql .= " ORDER BY created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    sendJSON($stmt->fetchAll());
}

// Admin - Upload Report
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'upload') {
    adminOnly();
    
    $case_id = $_POST['case_id'];
    $password = $_POST['cnic']; // Used as Patient Password
    $patient_name = $_POST['patient_name'];
    $patient_phone = $_POST['patient_phone'] ?? '';
    $status = $_POST['status'];

    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        sendJSON(['error' => 'No file uploaded'], 400);
    }

    $file = $_FILES['file'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];

    if (!in_array($ext, $allowed)) {
        sendJSON(['error' => 'Invalid file type'], 400);
    }

    $uploadDir = '../uploads/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
    
    $safeName = preg_replace("/[^a-zA-Z0-9]/", "_", $case_id) . "_" . time() . "." . $ext;
    $targetPath = $uploadDir . $safeName;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        $stmt = $pdo->prepare("INSERT INTO reports (case_id, cnic, patient_name, patient_phone, status, file_path) VALUES (?, ?, ?, ?, ?, ?)");
        try {
            $stmt->execute([$case_id, $password, $patient_name, $patient_phone, $status, 'uploads/' . $safeName]);
            sendJSON(['message' => 'Success', 'notified' => $patient_phone]);
        } catch (Exception $e) {
            unlink($targetPath); // Delete file if DB fails
            sendJSON(['error' => 'Case ID already exists or DB Error'], 400);
        }
    } else {
        sendJSON(['error' => 'Failed to save file'], 500);
    }
}

// Admin - Update Status
if ($_SERVER['REQUEST_METHOD'] === 'PUT' && $action === 'updateStatus') {
    adminOnly();
    $case_id = $_GET['id'] ?? '';
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("UPDATE reports SET status = ? WHERE case_id = ?");
    $stmt->execute([$data['status'], $case_id]);
    sendJSON(['message' => 'Status updated']);
}

// Admin - Delete Report
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $action === 'delete') {
    adminOnly();
    $case_id = $_GET['id'] ?? '';
    $stmt = $pdo->prepare("DELETE FROM reports WHERE case_id = ?");
    $stmt->execute([$case_id]);
    sendJSON(['message' => 'Report deleted']);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $action === 'deleteAll') {
    adminOnly();
    $pdo->query("DELETE FROM reports");
    sendJSON(['message' => 'All reports deleted']);
}
?>
