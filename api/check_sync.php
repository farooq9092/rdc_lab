<?php
echo "<h1>Deployment Sync Check</h1>";
$files = ['index.html', 'style.css', 'script.js', 'api/config.php', 'api/feedback.php'];

echo "<table border='1' cellpadding='10' style='border-collapse:collapse;'>";
echo "<tr><th>File</th><th>Status</th><th>Last Modified</th></tr>";

foreach ($files as $file) {
    echo "<tr>";
    echo "<td>$file</td>";
    if (file_exists('../' . $file)) {
        echo "<td style='color:green'>Found</td>";
        echo "<td>" . date("Y-m-d H:i:s", filemtime('../' . $file)) . "</td>";
    } else {
        echo "<td style='color:red'>Not Found</td>";
        echo "<td>-</td>";
    }
    echo "</tr>";
}
echo "</table>";

echo "<p>Current Server Time: " . date("Y-m-d H:i:s") . "</p>";
?>
