<?php
// Database Connection Debug Tool
echo "<h2>🔍 Database Connection Debug</h2>";

echo "<h3>Environment Variables:</h3>";
echo "<pre>";
echo "DATABASE_URL: " . ($_ENV['DATABASE_URL'] ?? 'NOT SET') . "\n";
echo "DATABASE_HOST: " . ($_ENV['DATABASE_HOST'] ?? 'NOT SET') . "\n"; 
echo "DATABASE_NAME: " . ($_ENV['DATABASE_NAME'] ?? 'NOT SET') . "\n";
echo "DATABASE_USER: " . ($_ENV['DATABASE_USER'] ?? 'NOT SET') . "\n";
echo "DATABASE_PASSWORD: " . (isset($_ENV['DATABASE_PASSWORD']) ? '[SET]' : 'NOT SET') . "\n";
echo "</pre>";

// Try to parse DATABASE_URL if it exists
if (isset($_ENV['DATABASE_URL'])) {
    echo "<h3>Parsed DATABASE_URL:</h3>";
    $db_url = parse_url($_ENV['DATABASE_URL']);
    echo "<pre>";
    echo "Host: " . ($db_url['host'] ?? 'NOT FOUND') . "\n";
    echo "Database: " . (ltrim($db_url['path'] ?? '', '/') ?: 'NOT FOUND') . "\n";
    echo "User: " . ($db_url['user'] ?? 'NOT FOUND') . "\n";
    echo "Password: " . (isset($db_url['pass']) ? '[SET]' : 'NOT FOUND') . "\n";
    echo "</pre>";
}

// Test connection
echo "<h3>Connection Test:</h3>";
try {
    require_once 'config/database.php';
    $database = new Database();
    $db = $database->getConnection();
    
    echo "<p style='color: green;'>✅ Database connection successful!</p>";
    
    // Test query
    $stmt = $db->query("SELECT 1 as test");
    $result = $stmt->fetch();
    echo "<p style='color: green;'>✅ Test query successful: " . $result['test'] . "</p>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Database connection failed:</p>";
    echo "<pre style='color: red; background: #fee; padding: 10px;'>" . $e->getMessage() . "</pre>";
}

echo "<hr>";
echo "<p><strong>Next Steps:</strong></p>";
echo "<ol>";
echo "<li>Make sure you've added a MySQL database service to Railway</li>";
echo "<li>Check that DATABASE_URL is set in your environment variables</li>";
echo "<li>If DATABASE_URL is missing, add the individual variables manually</li>";
echo "<li>Once connection works, visit <a href='/init.php'>/init.php</a> to initialize</li>";
echo "</ol>";
?>

<style>
body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
h2, h3 { color: #333; }
pre { background: #f8f8f8; padding: 15px; border: 1px solid #ddd; border-radius: 4px; }
</style>