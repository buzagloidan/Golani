<?php
require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "🔄 Initializing Golani MMORPG Database...\n\n";
    
    // Read and execute schema
    $schema = file_get_contents('../database/schema.sql');
    $statements = explode(';', $schema);
    
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (!empty($statement)) {
            $db->exec($statement);
        }
    }
    
    echo "✅ Schema created successfully\n";
    
    // Read and execute seed data
    $seed_data = file_get_contents('../database/seed_data.sql');
    $statements = explode(';', $seed_data);
    
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (!empty($statement) && strpos($statement, '--') !== 0) {
            try {
                $db->exec($statement);
            } catch (PDOException $e) {
                // Ignore duplicate entry errors for seeding
                if ($e->getCode() != 23000) {
                    throw $e;
                }
            }
        }
    }
    
    echo "✅ Seed data inserted successfully\n";
    
    // Create admin account if it doesn't exist
    $admin_check = $db->prepare("SELECT COUNT(*) as count FROM players WHERE username = 'admin'");
    $admin_check->execute();
    $admin_exists = $admin_check->fetch()['count'] > 0;
    
    if (!$admin_exists) {
        $admin_password = password_hash('admin123', PASSWORD_DEFAULT);
        $admin_stmt = $db->prepare("
            INSERT INTO players (username, email, password_hash, rank_id, recruitment_cycle, money, experience, level) 
            VALUES ('admin', 'admin@golani.idf.gov.il', ?, 9, 'September_2025', 50000.00, 10000, 10)
        ");
        $admin_stmt->execute([$admin_password]);
        echo "✅ Admin account created (username: admin, password: admin123)\n";
    }
    
    echo "\n🎮 Database initialization completed successfully!\n";
    echo "📊 Game statistics:\n";
    
    // Show statistics
    $stats = [
        'ranks' => $db->query("SELECT COUNT(*) FROM ranks")->fetchColumn(),
        'jobs' => $db->query("SELECT COUNT(*) FROM jobs")->fetchColumn(),
        'units' => $db->query("SELECT COUNT(*) FROM units")->fetchColumn(),
        'missions' => $db->query("SELECT COUNT(*) FROM missions")->fetchColumn(),
        'achievements' => $db->query("SELECT COUNT(*) FROM achievements")->fetchColumn(),
        'players' => $db->query("SELECT COUNT(*) FROM players")->fetchColumn()
    ];
    
    foreach ($stats as $table => $count) {
        echo "   • " . ucfirst($table) . ": {$count}\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>