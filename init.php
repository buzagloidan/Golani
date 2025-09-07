<?php
// Golani MMORPG - Database Initialization Endpoint
// Visit this page ONCE after adding MySQL database to Railway

// Security check - only allow this to run if no players exist yet
require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if database is already initialized
    $check_stmt = $db->query("SHOW TABLES LIKE 'players'");
    $table_exists = $check_stmt->rowCount() > 0;
    
    if ($table_exists) {
        $player_count = $db->query("SELECT COUNT(*) FROM players")->fetchColumn();
        if ($player_count > 0) {
            die("🔒 Database already initialized with {$player_count} players. Delete this file for security.");
        }
    }
    
} catch (Exception $e) {
    // Database doesn't exist yet, continue with initialization
}

// Include the initialization script
require_once 'install/init_database.php';

echo "<br><br>";
echo "<div style='background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 5px; font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; text-align: center;'>";
echo "<h2>🎮 גולני MMORPG - Database Initialized!</h2>";
echo "<p><strong>✅ Database setup completed successfully!</strong></p>";
echo "<p>You can now:</p>";
echo "<ul style='text-align: left; display: inline-block;'>";
echo "<li>Visit the <a href='/'>homepage</a> to register new players</li>";
echo "<li>Login with admin account: <strong>username:</strong> admin, <strong>password:</strong> admin123</li>";
echo "<li>Test the game features at <a href='/game.php'>game interface</a></li>";
echo "</ul>";
echo "<p style='color: #721c24; background: #f8d7da; padding: 10px; border-radius: 3px; margin-top: 15px;'>";
echo "<strong>🔥 SECURITY WARNING:</strong> Delete this file (init.php) immediately after use!";
echo "</p>";
echo "</div>";

// Add some styling for better presentation
echo "<style>";
echo "body { background: linear-gradient(135deg, #1e3c72, #2a5298); min-height: 100vh; margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }";
echo "</style>";
?>