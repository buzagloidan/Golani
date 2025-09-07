<?php
session_start();
require_once 'config/database.php';

// Check if user is logged in
if (!isset($_SESSION['player_id'])) {
    header("Location: /index.php");
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get player data with rank and job info
    $player_stmt = $db->prepare("
        SELECT p.*, r.name_hebrew as rank_name, r.level as rank_level, r.salary,
               j.name_hebrew as job_name, j.hourly_wage,
               u.name as unit_name,
               ba.balance as bank_balance, ba.savings
        FROM players p
        JOIN ranks r ON p.rank_id = r.id
        LEFT JOIN jobs j ON p.job_id = j.id
        LEFT JOIN units u ON p.unit_id = u.id
        LEFT JOIN bank_accounts ba ON p.id = ba.player_id
        WHERE p.id = ?
    ");
    $player_stmt->execute([$_SESSION['player_id']]);
    $player = $player_stmt->fetch();
    
    if (!$player) {
        session_destroy();
        header("Location: /index.php");
        exit;
    }
    
    // Get active missions count
    $missions_stmt = $db->prepare("
        SELECT COUNT(*) as active_missions
        FROM mission_participants mp
        JOIN missions m ON mp.mission_id = m.id
        WHERE mp.player_id = ? AND m.status = 'פעיל' AND mp.completed = FALSE
    ");
    $missions_stmt->execute([$_SESSION['player_id']]);
    $active_missions = $missions_stmt->fetchColumn();
    
    // Get recent achievements
    $achievements_stmt = $db->prepare("
        SELECT a.name, a.description, a.icon, pa.earned_at
        FROM player_achievements pa
        JOIN achievements a ON pa.achievement_id = a.id
        WHERE pa.player_id = ?
        ORDER BY pa.earned_at DESC
        LIMIT 3
    ");
    $achievements_stmt->execute([$_SESSION['player_id']]);
    $recent_achievements = $achievements_stmt->fetchAll();
    
    // Get online players count
    $online_stmt = $db->prepare("
        SELECT COUNT(*) as online_count
        FROM players
        WHERE last_active > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
    ");
    $online_stmt->execute();
    $online_players = $online_stmt->fetchColumn();
    
} catch (Exception $e) {
    error_log("Game page error: " . $e->getMessage());
    die("שגיאה בטעינת הנתונים");
}
?>

<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($player['username']); ?> - גולני MMORPG</title>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="stylesheet" href="assets/css/game.css">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@300;400;500;700&display=swap" rel="stylesheet">
</head>
<body class="game-body">
    <!-- Game Header -->
    <header class="game-header">
        <div class="header-content">
            <div class="header-left">
                <div class="player-info">
                    <div class="player-avatar">
                        <span class="rank-icon"><?php echo $player['rank_level']; ?></span>
                    </div>
                    <div class="player-details">
                        <h3><?php echo htmlspecialchars($player['username']); ?></h3>
                        <p><?php echo htmlspecialchars($player['rank_name']); ?></p>
                    </div>
                </div>
            </div>
            
            <div class="header-center">
                <div class="game-stats">
                    <div class="stat-item">
                        <span class="stat-icon">💰</span>
                        <span class="stat-value"><?php echo number_format($player['money'], 0); ?></span>
                        <span class="stat-label">ש"ח</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">⭐</span>
                        <span class="stat-value"><?php echo number_format($player['experience']); ?></span>
                        <span class="stat-label">נסיון</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">❤️</span>
                        <span class="stat-value"><?php echo $player['health']; ?></span>
                        <span class="stat-label">בריאות</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">⚡</span>
                        <span class="stat-value"><?php echo $player['energy']; ?></span>
                        <span class="stat-label">אנרגיה</span>
                    </div>
                </div>
            </div>
            
            <div class="header-right">
                <div class="game-nav">
                    <a href="/" class="nav-btn">🏠 דף הבית</a>
                    <a href="auth/logout.php" class="nav-btn">🚪 יציאה</a>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Game Content -->
    <main class="game-main">
        <div class="game-container">
            <!-- Sidebar -->
            <aside class="game-sidebar">
                <nav class="sidebar-nav">
                    <a href="#dashboard" class="nav-item active" data-section="dashboard">
                        <span class="nav-icon">🏠</span>
                        <span class="nav-text">לוח בקרה</span>
                    </a>
                    <a href="#missions" class="nav-item" data-section="missions">
                        <span class="nav-icon">⚔️</span>
                        <span class="nav-text">משימות</span>
                    </a>
                    <a href="#jobs" class="nav-item" data-section="jobs">
                        <span class="nav-icon">💼</span>
                        <span class="nav-text">עבודות</span>
                    </a>
                    <a href="#bank" class="nav-item" data-section="bank">
                        <span class="nav-icon">🏦</span>
                        <span class="nav-text">בנק</span>
                    </a>
                    <a href="#units" class="nav-item" data-section="units">
                        <span class="nav-icon">👥</span>
                        <span class="nav-text">יחידות</span>
                    </a>
                    <a href="#chat" class="nav-item" data-section="chat">
                        <span class="nav-icon">💬</span>
                        <span class="nav-text">צ'אט</span>
                    </a>
                    <a href="#profile" class="nav-item" data-section="profile">
                        <span class="nav-icon">👤</span>
                        <span class="nav-text">פרופיל</span>
                    </a>
                </nav>
            </aside>

            <!-- Content Area -->
            <section class="game-content">
                <!-- Dashboard Section -->
                <div class="content-section" id="dashboard-section">
                    <div class="section-header">
                        <h2>לוח בקרה - ברוך השב <?php echo htmlspecialchars($player['username']); ?>!</h2>
                        <p>מצב הבסיס: <span class="status-active">פעיל</span> | חיילים מחוברים: <span class="online-count"><?php echo $online_players; ?></span></p>
                    </div>

                    <div class="dashboard-grid">
                        <!-- Player Status Card -->
                        <div class="card">
                            <div class="card-header">
                                <h3>🎖️ סטטוס חייל</h3>
                            </div>
                            <div class="card-content">
                                <div class="status-grid">
                                    <div class="status-item">
                                        <span class="status-label">דרגה:</span>
                                        <span class="status-value"><?php echo htmlspecialchars($player['rank_name']); ?></span>
                                    </div>
                                    <div class="status-item">
                                        <span class="status-label">רמה:</span>
                                        <span class="status-value"><?php echo $player['level']; ?></span>
                                    </div>
                                    <div class="status-item">
                                        <span class="status-label">מחזור גיוס:</span>
                                        <span class="status-value"><?php echo htmlspecialchars($player['recruitment_cycle']); ?></span>
                                    </div>
                                    <div class="status-item">
                                        <span class="status-label">יחידה:</span>
                                        <span class="status-value"><?php echo $player['unit_name'] ?: 'ללא יחידה'; ?></span>
                                    </div>
                                    <div class="status-item">
                                        <span class="status-label">עבודה:</span>
                                        <span class="status-value"><?php echo $player['job_name'] ?: 'ללא עבודה'; ?></span>
                                    </div>
                                    <div class="status-item">
                                        <span class="status-label">מיקום:</span>
                                        <span class="status-value"><?php echo htmlspecialchars($player['location']); ?></span>
                                    </div>
                                </div>
                                
                                <!-- Progress Bar -->
                                <div class="progress-section">
                                    <h4>התקדמות לדרגה הבאה</h4>
                                    <?php
                                    $next_rank_stmt = $db->prepare("SELECT required_experience FROM ranks WHERE level = ? LIMIT 1");
                                    $next_rank_stmt->execute([$player['rank_level'] + 1]);
                                    $next_rank_exp = $next_rank_stmt->fetchColumn() ?: 999999;
                                    $current_rank_stmt = $db->prepare("SELECT required_experience FROM ranks WHERE level = ? LIMIT 1");
                                    $current_rank_stmt->execute([$player['rank_level']]);
                                    $current_rank_exp = $current_rank_stmt->fetchColumn() ?: 0;
                                    $progress = min(100, (($player['experience'] - $current_rank_exp) / max(1, $next_rank_exp - $current_rank_exp)) * 100);
                                    ?>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: <?php echo $progress; ?>%"></div>
                                    </div>
                                    <p><?php echo $player['experience']; ?> / <?php echo $next_rank_exp; ?> נסיון</p>
                                </div>
                            </div>
                        </div>

                        <!-- Active Missions Card -->
                        <div class="card">
                            <div class="card-header">
                                <h3>⚔️ משימות פעילות</h3>
                            </div>
                            <div class="card-content">
                                <?php if ($active_missions > 0): ?>
                                    <p class="highlight">יש לך <?php echo $active_missions; ?> משימות פעילות</p>
                                    <a href="#missions" class="btn btn-primary" onclick="showSection('missions')">צפה במשימות</a>
                                <?php else: ?>
                                    <p>אין לך משימות פעילות כרגע</p>
                                    <a href="#missions" class="btn btn-secondary" onclick="showSection('missions')">חפש משימות</a>
                                <?php endif; ?>
                            </div>
                        </div>

                        <!-- Achievements Card -->
                        <div class="card">
                            <div class="card-header">
                                <h3>🏅 הישגים אחרונים</h3>
                            </div>
                            <div class="card-content">
                                <?php if (count($recent_achievements) > 0): ?>
                                    <div class="achievements-list">
                                        <?php foreach ($recent_achievements as $achievement): ?>
                                            <div class="achievement-item">
                                                <span class="achievement-icon"><?php echo $achievement['icon']; ?></span>
                                                <div class="achievement-info">
                                                    <strong><?php echo htmlspecialchars($achievement['name']); ?></strong>
                                                    <small><?php echo date('d/m/Y', strtotime($achievement['earned_at'])); ?></small>
                                                </div>
                                            </div>
                                        <?php endforeach; ?>
                                    </div>
                                <?php else: ?>
                                    <p>עדיין לא זכית בהישגים. התחל במשימות כדי לזכות בהישגים!</p>
                                <?php endif; ?>
                            </div>
                        </div>

                        <!-- Quick Actions Card -->
                        <div class="card">
                            <div class="card-header">
                                <h3>⚡ פעולות מהירות</h3>
                            </div>
                            <div class="card-content">
                                <div class="quick-actions">
                                    <button class="btn btn-small" onclick="showSection('missions')">🎯 חפש משימות</button>
                                    <button class="btn btn-small" onclick="showSection('jobs')">💼 חפש עבודה</button>
                                    <button class="btn btn-small" onclick="showSection('bank')">💰 לבנק</button>
                                    <button class="btn btn-small" onclick="showSection('chat')">💬 צ'אט</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Other sections will be added here -->
                <div class="content-section" id="missions-section" style="display: none;">
                    <h2>משימות</h2>
                    <p>מערכת המשימות בפיתוח...</p>
                </div>

                <div class="content-section" id="jobs-section" style="display: none;">
                    <h2>עבודות</h2>
                    <p>מערכת העבודות בפיתוח...</p>
                </div>

                <div class="content-section" id="bank-section" style="display: none;">
                    <h2>בנק גולני</h2>
                    <p>מערכת הבנק בפיתוח...</p>
                </div>

                <div class="content-section" id="units-section" style="display: none;">
                    <h2>יחידות</h2>
                    <p>מערכת היחידות בפיתוח...</p>
                </div>

                <div class="content-section" id="chat-section" style="display: none;">
                    <h2>צ'אט</h2>
                    <p>מערכת הצ'אט בפיתוח...</p>
                </div>

                <div class="content-section" id="profile-section" style="display: none;">
                    <h2>פרופיל</h2>
                    <p>עמוד הפרופיל בפיתוח...</p>
                </div>
            </section>
        </div>
    </main>

    <script src="assets/js/main.js"></script>
    <script src="assets/js/game.js"></script>
</body>
</html>