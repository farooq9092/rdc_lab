<?php
require_once 'config.php';

// Check if tables already exist
try {
    $check = $pdo->query("SHOW TABLES LIKE 'reports'");
    if ($check->rowCount() > 0) {
        die("Database is already initialized. Please delete this file (init_db.php) for security.");
    }

    // Create users table
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Create reports table
    $pdo->exec("CREATE TABLE IF NOT EXISTS reports (
        case_id VARCHAR(50) PRIMARY KEY,
        cnic VARCHAR(20) NOT NULL,
        patient_name VARCHAR(100) NOT NULL,
        patient_phone VARCHAR(20),
        patient_age VARCHAR(10),
        patient_gender VARCHAR(20),
        test_name VARCHAR(100),
        result TEXT,
        status VARCHAR(20) DEFAULT 'Pending',
        file_path VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Create bookings table
    $pdo->exec("CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        package VARCHAR(100),
        address TEXT,
        status VARCHAR(20) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Insert default admin
    $pdo->exec("INSERT INTO users (username, password) 
    VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')");

    echo "<h1>Mubarak Ho!</h1><p>Database tables created successfully. You can now login to the Admin Dashboard.</p>";
    echo "<p><strong>IMPORTANT:</strong> Delete this file (<code>api/init_db.php</code>) immediately!</p>";

} catch (PDOException $e) {
    echo "<h1>Error!</h1><p>Failed to initialize database: " . $e->getMessage() . "</p>";
    echo "<p>Check your <code>api/config.php</code> file for correct database details.</p>";
}
?>
