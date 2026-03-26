<?php
require_once 'config.php';

echo "<html><head><title>Database Sync | Al-Rasheed Lab</title><style>body{font-family:sans-serif;line-height:1.6;padding:40px;background:#f8fafc;} .success{color:green;font-weight:bold;} .error{color:red;font-weight:bold;} .box{background:white;padding:20px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.1);}</style></head><body>";
echo "<div class='box'><h1>System Synchronization...</h1>";

try {
    // 1. Users Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    echo "<p class='success'>✅ Users table verified.</p>";

    // 2. Reports Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS reports (
        case_id VARCHAR(50) PRIMARY KEY,
        cnic VARCHAR(20) NOT NULL,
        patient_name VARCHAR(100) NOT NULL,
        patient_phone VARCHAR(20),
        status VARCHAR(20) DEFAULT 'Pending',
        file_path VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    echo "<p class='success'>✅ Reports table verified.</p>";

    // 3. Bookings Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        package VARCHAR(100),
        address TEXT,
        status VARCHAR(20) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    echo "<p class='success'>✅ Bookings table verified.</p>";

    // 4. Gallery Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        url VARCHAR(255) NOT NULL,
        title VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    echo "<p class='success'>✅ Gallery table verified.</p>";

    // 5. Feedback Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        comment TEXT NOT NULL,
        rating INT DEFAULT 5,
        status VARCHAR(20) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    echo "<p class='success'>✅ Feedback table verified (Patient Testimonials).</p>";

    // 6. Force Update Admin (Pass: password)
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = 'admin'");
    $stmt->execute();
    $admin = $stmt->fetch();
    
    $hashed_pass = password_hash('password', PASSWORD_DEFAULT);
    
    if (!$admin) {
        $pdo->prepare("INSERT INTO users (username, password) VALUES ('admin', ?)")->execute([$hashed_pass]);
        echo "<p class='success'>🎉 New Admin user created!</p>";
    } else {
        $pdo->prepare("UPDATE users SET password = ? WHERE username = 'admin'")->execute([$hashed_pass]);
        echo "<p class='success'>🔄 Admin password synchronized successfully.</p>";
    }

    echo "<hr><h2>SYSTEM READY! 🚀</h2>";
    echo "<p>Your dashboard is now fully functional with Gallery and Feedback management.</p>";
    echo "<ul>
            <li><strong>Username:</strong> admin</li>
            <li><strong>Password:</strong> password</li>
          </ul>";
    echo "<p><a href='../admin/' style='background: #00ADEF; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;'>Enter Admin Dashboard</a></p>";
    echo "<p style='color:red; font-size: 0.8rem; margin-top:20px;'>⚠️ SECURITY: Please delete <code>api/init_db.php</code> from your server now.</p>";

} catch (PDOException $e) {
    echo "<h2 class='error'>❌ Sync Failed</h2>";
    echo "<p>The site could not connect to the database. Please verify your <code>api/config.php</code> file.</p>";
    echo "<p style='color:#666; font-size:0.9rem;'><strong>System Error:</strong> " . $e->getMessage() . "</p>";
}
echo "</div></body></html>";
?>
