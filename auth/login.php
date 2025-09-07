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
    $password = $_POST['password'] ?? '';
    $remember_me = isset($_POST['remember_me']);
    
    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'שם משתמש וסיסמה נדרשים']);
        exit;
    }
    
    // Find user by username or email
    $stmt = $db->prepare("
        SELECT p.id, p.username, p.password_hash, p.rank_id, r.name_hebrew as rank_name, p.last_active
        FROM players p
        JOIN ranks r ON p.rank_id = r.id
        WHERE p.username = ? OR p.email = ?
    ");
    $stmt->execute([$username, $username]);
    $player = $stmt->fetch();
    
    if (!$player || !password_verify($password, $player['password_hash'])) {
        echo json_encode(['success' => false, 'message' => 'שם משתמש או סיסמה שגויים']);
        exit;
    }
    
    // Update last active time
    $update_stmt = $db->prepare("UPDATE players SET last_active = CURRENT_TIMESTAMP WHERE id = ?");
    $update_stmt->execute([$player['id']]);
    
    // Set session variables
    $_SESSION['player_id'] = $player['id'];
    $_SESSION['player_name'] = $player['username'];
    $_SESSION['rank_id'] = $player['rank_id'];
    $_SESSION['rank_name'] = $player['rank_name'];
    
    // Set remember me cookie if requested
    if ($remember_me) {
        $token = bin2hex(random_bytes(32));
        // In production, store this token in database and use it for auto-login
        setcookie('remember_token', $token, time() + (30 * 24 * 60 * 60), '/', '', true, true); // 30 days
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'התחברת בהצלחה! ברוך השב לגולני',
        'player' => [
            'name' => $player['username'],
            'rank' => $player['rank_name']
        ],
        'redirect' => '/game.php'
    ]);
    
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'שגיאה במערכת. נסה שוב מאוחר יותר']);
}
?>