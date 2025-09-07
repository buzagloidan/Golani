<?php
session_start();
require_once '../config/database.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    $recruitment_cycle = $_POST['recruitment_cycle'] ?? '';
    
    // Validation
    if (empty($username) || empty($email) || empty($password) || empty($recruitment_cycle)) {
        echo json_encode(['success' => false, 'message' => 'כל השדות נדרשים']);
        exit;
    }
    
    if (strlen($username) < 3 || strlen($username) > 20) {
        echo json_encode(['success' => false, 'message' => 'שם המשתמש חייב להיות בין 3-20 תווים']);
        exit;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'כתובת דוא"ל לא תקינה']);
        exit;
    }
    
    if (strlen($password) < 8) {
        echo json_encode(['success' => false, 'message' => 'הסיסמה חייבת להיות לפחות 8 תווים']);
        exit;
    }
    
    if ($password !== $confirm_password) {
        echo json_encode(['success' => false, 'message' => 'הסיסמאות אינן תואמות']);
        exit;
    }
    
    // Check if username or email already exists
    $check_stmt = $db->prepare("SELECT COUNT(*) as count FROM players WHERE username = ? OR email = ?");
    $check_stmt->execute([$username, $email]);
    $exists = $check_stmt->fetch()['count'] > 0;
    
    if ($exists) {
        echo json_encode(['success' => false, 'message' => 'שם המשתמש או כתובת הדוא"ל כבר קיימים במערכת']);
        exit;
    }
    
    // Create new player
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    $starting_money = 2000.00; // Starting money for new recruits
    
    $db->beginTransaction();
    
    try {
        // Insert new player
        $stmt = $db->prepare("
            INSERT INTO players (username, email, password_hash, recruitment_cycle, money, rank_id, level) 
            VALUES (?, ?, ?, ?, ?, 1, 1)
        ");
        $stmt->execute([$username, $email, $password_hash, $recruitment_cycle, $starting_money]);
        
        $player_id = $db->lastInsertId();
        
        // Create bank account
        $bank_stmt = $db->prepare("INSERT INTO bank_accounts (player_id, balance) VALUES (?, 0.00)");
        $bank_stmt->execute([$player_id]);
        
        // Award "חייל חדש" achievement
        $achievement_stmt = $db->prepare("
            INSERT INTO player_achievements (player_id, achievement_id) 
            VALUES (?, (SELECT id FROM achievements WHERE name = 'חייל חדש' LIMIT 1))
        ");
        $achievement_stmt->execute([$player_id]);
        
        // Log the initial money transaction
        $transaction_stmt = $db->prepare("
            INSERT INTO transactions (player_id, type, amount, description, balance_before, balance_after)
            VALUES (?, 'הכנסה', ?, 'מענק גיוס', 0.00, ?)
        ");
        $transaction_stmt->execute([$player_id, $starting_money, $starting_money]);
        
        $db->commit();
        
        // Set session
        $_SESSION['player_id'] = $player_id;
        $_SESSION['player_name'] = $username;
        $_SESSION['rank_id'] = 1;
        
        echo json_encode([
            'success' => true, 
            'message' => 'ההרשמה הושלמה בהצלחה! ברוך הבא לגולני',
            'redirect' => '/game.php'
        ]);
        
    } catch (Exception $e) {
        $db->rollback();
        throw $e;
    }
    
} catch (Exception $e) {
    error_log("Registration error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'שגיאה במערכת. נסה שוב מאוחר יותר']);
}
?>