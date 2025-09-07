# Golani MMORPG - Technical Architecture
## Complete Technical Specification for HTML/CSS/PHP/SQLite Implementation

---

## 🏗️ System Architecture Overview

### Core Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: PHP 8.1+ with PDO
- **Database**: SQLite 3.x
- **Real-time**: Server-Sent Events (SSE) + AJAX Long Polling
- **Caching**: PHP File Caching + SQLite Memory Tables

### Project Structure
```
/Golani/
├── 📁 public/              # Web root
│   ├── index.php          # Game entry point
│   ├── 📁 assets/         # Static files
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   └── 📁 api/            # AJAX endpoints
├── 📁 src/                # Application logic
│   ├── 📁 classes/        # PHP classes
│   ├── 📁 config/         # Configuration
│   ├── 📁 templates/      # HTML templates
│   └── 📁 utils/          # Utility functions
├── 📁 database/           # SQLite files
│   ├── golani.db         # Main database
│   └── sessions.db       # Session storage
└── 📁 logs/              # Application logs
```

---

## 🗄️ Database Architecture

### Core Tables Schema

```sql
-- Users/Players Table
CREATE TABLE players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    recruitment_cycle VARCHAR(20) NOT NULL,  -- e.g., 'August_2025'
    rank_id INTEGER DEFAULT 1,
    unit_id INTEGER DEFAULT 1,
    base_id INTEGER DEFAULT 1,
    health INTEGER DEFAULT 100,
    energy INTEGER DEFAULT 100,
    money INTEGER DEFAULT 500,
    experience INTEGER DEFAULT 0,
    combat_points INTEGER DEFAULT 0,
    leadership_points INTEGER DEFAULT 0,
    morale_points INTEGER DEFAULT 100,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (rank_id) REFERENCES ranks(id),
    FOREIGN KEY (unit_id) REFERENCES units(id),
    FOREIGN KEY (base_id) REFERENCES bases(id)
);

-- Ranks System
CREATE TABLE ranks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_hebrew VARCHAR(50) NOT NULL,
    name_english VARCHAR(50) NOT NULL,
    level INTEGER NOT NULL,
    salary_base INTEGER DEFAULT 0,
    xp_required INTEGER NOT NULL
);

-- Military Units
CREATE TABLE units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_hebrew VARCHAR(100) NOT NULL,
    name_english VARCHAR(100) NOT NULL,
    unit_type ENUM('company', 'platoon', 'squad') NOT NULL,
    parent_unit_id INTEGER NULL,
    commander_id INTEGER NULL,
    max_members INTEGER DEFAULT 50,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_unit_id) REFERENCES units(id),
    FOREIGN KEY (commander_id) REFERENCES players(id)
);

-- Military Bases
CREATE TABLE bases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_hebrew VARCHAR(100) NOT NULL,
    name_english VARCHAR(100) NOT NULL,
    base_type ENUM('main', 'training', 'emergency', 'hospital', 'prison') NOT NULL,
    capacity INTEGER DEFAULT 1000,
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT 1
);

-- Jobs/Positions System
CREATE TABLE jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_hebrew VARCHAR(100) NOT NULL,
    name_english VARCHAR(100) NOT NULL,
    base_salary INTEGER NOT NULL,
    max_salary INTEGER NOT NULL,
    energy_cost INTEGER DEFAULT 10,
    xp_reward INTEGER DEFAULT 5,
    required_rank INTEGER DEFAULT 1,
    max_workers INTEGER DEFAULT 10
);

-- Player Jobs Assignment
CREATE TABLE player_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,
    skill_level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    total_hours INTEGER DEFAULT 0,
    current_shift_start DATETIME NULL,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    UNIQUE(player_id, job_id)
);

-- Missions/Tasks System
CREATE TABLE missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_hebrew VARCHAR(200) NOT NULL,
    description_hebrew TEXT NOT NULL,
    mission_type ENUM('attack', 'defense', 'training', 'patrol', 'guard') NOT NULL,
    difficulty INTEGER DEFAULT 1,
    energy_required INTEGER DEFAULT 20,
    xp_reward INTEGER DEFAULT 10,
    money_reward INTEGER DEFAULT 50,
    min_rank INTEGER DEFAULT 1,
    max_participants INTEGER DEFAULT 1,
    duration_minutes INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Player Mission Participation
CREATE TABLE player_missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    mission_id INTEGER NOT NULL,
    status ENUM('active', 'completed', 'failed', 'abandoned') NOT NULL,
    started_at DATETIME NOT NULL,
    completed_at DATETIME NULL,
    result_data JSON NULL, -- Store mission results
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (mission_id) REFERENCES missions(id)
);

-- Banking System
CREATE TABLE bank_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    account_type ENUM('personal', 'loan', 'savings', 'insurance') DEFAULT 'personal',
    balance INTEGER DEFAULT 0,
    interest_rate DECIMAL(5,2) DEFAULT 0.0,
    last_interest DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Transactions Log
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_account_id INTEGER NULL,
    to_account_id INTEGER NULL,
    amount INTEGER NOT NULL,
    transaction_type ENUM('job_payment', 'mission_reward', 'purchase', 'transfer', 'loan', 'interest') NOT NULL,
    description_hebrew VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_account_id) REFERENCES bank_accounts(id),
    FOREIGN KEY (to_account_id) REFERENCES bank_accounts(id)
);

-- Real-time Chat System
CREATE TABLE chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    room_type ENUM('global', 'unit', 'base', 'private') NOT NULL,
    room_id INTEGER NOT NULL, -- unit_id, base_id, or receiver_id
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES players(id)
);

-- Game Events/News
CREATE TABLE game_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_hebrew VARCHAR(200) NOT NULL,
    content_hebrew TEXT NOT NULL,
    event_type ENUM('news', 'mission', 'celebration', 'emergency') NOT NULL,
    target_audience ENUM('all', 'unit', 'base', 'rank') DEFAULT 'all',
    target_id INTEGER NULL,
    is_active BOOLEAN DEFAULT 1,
    start_date DATETIME NOT NULL,
    end_date DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Player Statistics & Analytics
CREATE TABLE player_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    stat_date DATE NOT NULL,
    missions_completed INTEGER DEFAULT 0,
    energy_used INTEGER DEFAULT 0,
    money_earned INTEGER DEFAULT 0,
    xp_gained INTEGER DEFAULT 0,
    time_played_minutes INTEGER DEFAULT 0,
    FOREIGN KEY (player_id) REFERENCES players(id),
    UNIQUE(player_id, stat_date)
);
```

### Database Optimization

```sql
-- Essential Indexes for Performance
CREATE INDEX idx_players_username ON players(username);
CREATE INDEX idx_players_last_login ON players(last_login);
CREATE INDEX idx_player_missions_status ON player_missions(status);
CREATE INDEX idx_chat_messages_room ON chat_messages(room_type, room_id);
CREATE INDEX idx_transactions_created ON transactions(created_at);
CREATE INDEX idx_game_events_active ON game_events(is_active, start_date, end_date);

-- Memory tables for frequently accessed data
CREATE TABLE temp.online_players (
    player_id INTEGER PRIMARY KEY,
    last_activity DATETIME,
    current_page VARCHAR(50)
);
```

---

## 🖥️ Frontend Architecture

### CSS Framework & RTL Support

```css
/* Base RTL Styles - assets/css/rtl-base.css */
html {
    direction: rtl;
    text-align: right;
}

body {
    font-family: 'Noto Sans Hebrew', 'Arial', sans-serif;
    background: linear-gradient(135deg, #2c3e50, #34495e);
    color: #ecf0f1;
    margin: 0;
    padding: 0;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    direction: rtl;
}

/* Military Theme Colors */
:root {
    --golani-primary: #8B4513;      /* Brown - Golani colors */
    --golani-secondary: #2F4F2F;    /* Dark Green */
    --golani-accent: #FFD700;       /* Gold */
    --energy-color: #3498db;        /* Blue */
    --health-color: #e74c3c;        /* Red */
    --money-color: #f39c12;         /* Orange */
    --xp-color: #9b59b6;           /* Purple */
}

/* Game UI Components */
.game-panel {
    background: rgba(44, 62, 80, 0.95);
    border: 2px solid var(--golani-primary);
    border-radius: 10px;
    padding: 20px;
    margin: 10px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

.status-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    flex-direction: row-reverse; /* RTL */
}

.stat-item {
    background: rgba(52, 73, 94, 0.8);
    padding: 10px 15px;
    border-radius: 20px;
    margin: 0 5px;
    text-align: center;
    min-width: 80px;
}

/* Progress Bars */
.progress-bar {
    width: 100%;
    height: 20px;
    background: rgba(0,0,0,0.3);
    border-radius: 10px;
    overflow: hidden;
    direction: ltr; /* Progress bars go left to right */
}

.progress-fill {
    height: 100%;
    transition: width 0.3s ease;
    border-radius: 10px;
}

.energy-fill { background: var(--energy-color); }
.health-fill { background: var(--health-color); }
.xp-fill { background: var(--xp-color); }

/* Responsive Design */
@media (max-width: 768px) {
    .status-bar {
        flex-direction: column;
    }
    
    .game-panel {
        margin: 5px;
        padding: 15px;
    }
}
```

### JavaScript Game Engine

```javascript
// assets/js/game-engine.js
class GolanGame {
    constructor() {
        this.player = {};
        this.gameState = 'loading';
        this.eventSource = null;
        this.updateInterval = null;
        this.init();
    }

    async init() {
        try {
            await this.loadPlayer();
            this.setupEventListeners();
            this.initRealTimeUpdates();
            this.startGameLoop();
            this.gameState = 'playing';
        } catch (error) {
            console.error('Game initialization failed:', error);
            this.showError('שגיאה בטעינת המשחק');
        }
    }

    async loadPlayer() {
        const response = await fetch('/api/player/profile');
        if (!response.ok) throw new Error('Failed to load player');
        this.player = await response.json();
        this.updateUI();
    }

    setupEventListeners() {
        // Mission buttons
        document.querySelectorAll('.mission-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const missionId = e.target.dataset.missionId;
                this.startMission(missionId);
            });
        });

        // Job buttons
        document.querySelectorAll('.job-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const jobId = e.target.dataset.jobId;
                this.startJob(jobId);
            });
        });

        // Chat input
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }
    }

    initRealTimeUpdates() {
        // Server-Sent Events for real-time updates
        this.eventSource = new EventSource('/api/events/stream');
        
        this.eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleRealTimeUpdate(data);
        };

        this.eventSource.onerror = () => {
            console.log('EventSource connection error, retrying...');
            setTimeout(() => this.initRealTimeUpdates(), 5000);
        };
    }

    handleRealTimeUpdate(data) {
        switch (data.type) {
            case 'player_update':
                this.player = { ...this.player, ...data.changes };
                this.updateUI();
                break;
            case 'mission_complete':
                this.handleMissionComplete(data);
                break;
            case 'chat_message':
                this.addChatMessage(data);
                break;
            case 'game_event':
                this.showGameEvent(data);
                break;
        }
    }

    async startMission(missionId) {
        if (this.player.energy < 20) {
            this.showMessage('אין מספיק אנרגיה למשימה');
            return;
        }

        try {
            const response = await fetch('/api/missions/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mission_id: missionId })
            });

            const result = await response.json();
            if (result.success) {
                this.showMessage('המשימה החלה בהצלחה');
                this.updateMissionUI(result.mission);
            } else {
                this.showMessage(result.message || 'שגיאה בהתחלת המשימה');
            }
        } catch (error) {
            this.showMessage('שגיאה בחיבור לשרת');
        }
    }

    async startJob(jobId) {
        try {
            const response = await fetch('/api/jobs/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ job_id: jobId })
            });

            const result = await response.json();
            if (result.success) {
                this.showMessage('העבודה החלה בהצלחה');
                this.player.current_job = result.job;
                this.updateUI();
            }
        } catch (error) {
            this.showMessage('שגיאה בחיבור לשרת');
        }
    }

    updateUI() {
        // Update status bars
        document.getElementById('energy-fill').style.width = `${this.player.energy}%`;
        document.getElementById('health-fill').style.width = `${this.player.health}%`;
        
        // Update text values
        document.getElementById('money-value').textContent = this.player.money.toLocaleString('he-IL');
        document.getElementById('xp-value').textContent = this.player.experience.toLocaleString('he-IL');
        document.getElementById('rank-name').textContent = this.player.rank_name;
        
        // Update current activity
        const activityEl = document.getElementById('current-activity');
        if (this.player.current_mission) {
            activityEl.textContent = `במשימה: ${this.player.current_mission.title}`;
            activityEl.className = 'activity-mission';
        } else if (this.player.current_job) {
            activityEl.textContent = `בעבודה: ${this.player.current_job.name}`;
            activityEl.className = 'activity-job';
        } else {
            activityEl.textContent = 'פנוי לפעילות';
            activityEl.className = 'activity-free';
        }
    }

    startGameLoop() {
        this.updateInterval = setInterval(() => {
            this.gameLoop();
        }, 30000); // Update every 30 seconds
    }

    gameLoop() {
        // Auto-save and sync with server
        this.saveGameState();
        
        // Check for completed activities
        this.checkCompletedActivities();
        
        // Regenerate energy slowly
        if (this.player.energy < 100 && !this.player.current_mission && !this.player.current_job) {
            this.player.energy = Math.min(100, this.player.energy + 1);
            this.updateUI();
        }
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `game-message message-${type}`;
        messageDiv.textContent = message;
        
        document.getElementById('messages').appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new GolanGame();
});
```

---

## 🔧 Backend PHP Architecture

### Core Application Structure

```php
<?php
// src/classes/Database.php
class Database {
    private static $instance = null;
    private $pdo;
    
    private function __construct() {
        $dbPath = __DIR__ . '/../../database/golani.db';
        $this->pdo = new PDO("sqlite:$dbPath");
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->pdo->exec("PRAGMA foreign_keys = ON");
    }
    
    public static function getInstance(): self {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getPdo(): PDO {
        return $this->pdo;
    }
    
    public function beginTransaction(): bool {
        return $this->pdo->beginTransaction();
    }
    
    public function commit(): bool {
        return $this->pdo->commit();
    }
    
    public function rollback(): bool {
        return $this->pdo->rollBack();
    }
}

// src/classes/Player.php
class Player {
    private $db;
    private $data;
    
    public function __construct($playerId = null) {
        $this->db = Database::getInstance()->getPdo();
        if ($playerId) {
            $this->load($playerId);
        }
    }
    
    public function load($playerId): bool {
        $stmt = $this->db->prepare("
            SELECT p.*, r.name_hebrew as rank_name, u.name_hebrew as unit_name, b.name_hebrew as base_name
            FROM players p
            LEFT JOIN ranks r ON p.rank_id = r.id
            LEFT JOIN units u ON p.unit_id = u.id
            LEFT JOIN bases b ON p.base_id = b.id
            WHERE p.id = ? AND p.is_active = 1
        ");
        
        $stmt->execute([$playerId]);
        $this->data = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($this->data) {
            $this->updateLastLogin();
            return true;
        }
        return false;
    }
    
    public function create($username, $password, $email, $recruitmentCycle): bool {
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        
        $stmt = $this->db->prepare("
            INSERT INTO players (username, password_hash, email, recruitment_cycle, created_at)
            VALUES (?, ?, ?, ?, datetime('now'))
        ");
        
        try {
            $stmt->execute([$username, $passwordHash, $email, $recruitmentCycle]);
            $this->load($this->db->lastInsertId());
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }
    
    public function authenticate($username, $password): bool {
        $stmt = $this->db->prepare("
            SELECT id, password_hash FROM players 
            WHERE username = ? AND is_active = 1
        ");
        
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && password_verify($password, $user['password_hash'])) {
            $this->load($user['id']);
            return true;
        }
        return false;
    }
    
    public function updateEnergy($amount): bool {
        $newEnergy = max(0, min(100, $this->data['energy'] + $amount));
        
        $stmt = $this->db->prepare("UPDATE players SET energy = ? WHERE id = ?");
        $result = $stmt->execute([$newEnergy, $this->data['id']]);
        
        if ($result) {
            $this->data['energy'] = $newEnergy;
        }
        return $result;
    }
    
    public function updateMoney($amount): bool {
        $newMoney = max(0, $this->data['money'] + $amount);
        
        $stmt = $this->db->prepare("UPDATE players SET money = ? WHERE id = ?");
        $result = $stmt->execute([$newMoney, $this->data['id']]);
        
        if ($result) {
            $this->data['money'] = $newMoney;
            
            // Log transaction
            $this->logTransaction(
                null, 
                $this->data['id'], 
                $amount, 
                $amount > 0 ? 'mission_reward' : 'purchase',
                $amount > 0 ? 'תגמול משימה' : 'רכישה'
            );
        }
        return $result;
    }
    
    public function addExperience($amount): bool {
        $newXP = $this->data['experience'] + $amount;
        
        $stmt = $this->db->prepare("UPDATE players SET experience = ? WHERE id = ?");
        $result = $stmt->execute([$newXP, $this->data['id']]);
        
        if ($result) {
            $this->data['experience'] = $newXP;
            $this->checkRankPromotion();
        }
        return $result;
    }
    
    private function checkRankPromotion(): void {
        $stmt = $this->db->prepare("
            SELECT id, name_hebrew FROM ranks 
            WHERE xp_required <= ? AND level > (
                SELECT level FROM ranks WHERE id = ?
            )
            ORDER BY level ASC LIMIT 1
        ");
        
        $stmt->execute([$this->data['experience'], $this->data['rank_id']]);
        $newRank = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($newRank) {
            $updateStmt = $this->db->prepare("UPDATE players SET rank_id = ? WHERE id = ?");
            $updateStmt->execute([$newRank['id'], $this->data['id']]);
            
            $this->data['rank_id'] = $newRank['id'];
            $this->data['rank_name'] = $newRank['name_hebrew'];
            
            // Send promotion notification
            $this->addNotification('קידום בדרגה', "קודמת לדרגת {$newRank['name_hebrew']}!", 'promotion');
        }
    }
    
    public function getCurrentMission(): ?array {
        $stmt = $this->db->prepare("
            SELECT pm.*, m.title_hebrew, m.description_hebrew, m.duration_minutes
            FROM player_missions pm
            JOIN missions m ON pm.mission_id = m.id
            WHERE pm.player_id = ? AND pm.status = 'active'
            ORDER BY pm.started_at DESC LIMIT 1
        ");
        
        $stmt->execute([$this->data['id']]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }
    
    public function getData(): array {
        return $this->data;
    }
    
    public function getId(): int {
        return $this->data['id'];
    }
    
    private function updateLastLogin(): void {
        $stmt = $this->db->prepare("UPDATE players SET last_login = datetime('now') WHERE id = ?");
        $stmt->execute([$this->data['id']]);
    }
    
    private function logTransaction($fromAccount, $toAccount, $amount, $type, $description): void {
        $stmt = $this->db->prepare("
            INSERT INTO transactions (from_account_id, to_account_id, amount, transaction_type, description_hebrew, created_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
        ");
        $stmt->execute([$fromAccount, $toAccount, $amount, $type, $description]);
    }
    
    private function addNotification($title, $message, $type): void {
        // Implementation for player notifications
        $stmt = $this->db->prepare("
            INSERT INTO player_notifications (player_id, title, message, type, created_at)
            VALUES (?, ?, ?, ?, datetime('now'))
        ");
        $stmt->execute([$this->data['id'], $title, $message, $type]);
    }
}

// src/classes/GameEngine.php
class GameEngine {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getPdo();
    }
    
    public function processMissionCompletion($playerMissionId): array {
        $stmt = $this->db->prepare("
            SELECT pm.*, m.xp_reward, m.money_reward, m.title_hebrew
            FROM player_missions pm
            JOIN missions m ON pm.mission_id = m.id
            WHERE pm.id = ? AND pm.status = 'active'
        ");
        
        $stmt->execute([$playerMissionId]);
        $mission = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$mission) {
            return ['success' => false, 'message' => 'משימה לא נמצאה'];
        }
        
        // Check if mission duration has passed
        $startTime = new DateTime($mission['started_at']);
        $currentTime = new DateTime();
        $duration = $mission['duration_minutes'] ?? 60;
        
        if ($currentTime < $startTime->add(new DateInterval("PT{$duration}M"))) {
            return ['success' => false, 'message' => 'המשימה עדיין בביצוע'];
        }
        
        $this->db->beginTransaction();
        
        try {
            // Complete mission
            $updateStmt = $this->db->prepare("
                UPDATE player_missions SET status = 'completed', completed_at = datetime('now') WHERE id = ?
            ");
            $updateStmt->execute([$playerMissionId]);
            
            // Reward player
            $player = new Player($mission['player_id']);
            $player->addExperience($mission['xp_reward']);
            $player->updateMoney($mission['money_reward']);
            
            // Update daily stats
            $this->updateDailyStats($mission['player_id'], [
                'missions_completed' => 1,
                'xp_gained' => $mission['xp_reward'],
                'money_earned' => $mission['money_reward']
            ]);
            
            $this->db->commit();
            
            return [
                'success' => true,
                'message' => "המשימה '{$mission['title_hebrew']}' הושלמה בהצלחה!",
                'rewards' => [
                    'xp' => $mission['xp_reward'],
                    'money' => $mission['money_reward']
                ]
            ];
            
        } catch (Exception $e) {
            $this->db->rollback();
            return ['success' => false, 'message' => 'שגיאה בעיבוד המשימה'];
        }
    }
    
    public function getAvailableMissions($playerId): array {
        $player = new Player($playerId);
        $playerData = $player->getData();
        
        $stmt = $this->db->prepare("
            SELECT * FROM missions 
            WHERE is_active = 1 
            AND min_rank <= ?
            AND id NOT IN (
                SELECT mission_id FROM player_missions 
                WHERE player_id = ? AND status = 'active'
            )
            ORDER BY difficulty ASC, xp_reward DESC
        ");
        
        $stmt->execute([$playerData['rank_id'], $playerId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function startMission($playerId, $missionId): array {
        $player = new Player($playerId);
        $playerData = $player->getData();
        
        // Get mission details
        $stmt = $this->db->prepare("SELECT * FROM missions WHERE id = ? AND is_active = 1");
        $stmt->execute([$missionId]);
        $mission = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$mission) {
            return ['success' => false, 'message' => 'משימה לא נמצאה'];
        }
        
        // Check requirements
        if ($playerData['energy'] < $mission['energy_required']) {
            return ['success' => false, 'message' => 'אין מספיק אנרגיה'];
        }
        
        if ($playerData['rank_id'] < $mission['min_rank']) {
            return ['success' => false, 'message' => 'דרגה נמוכה מדי'];
        }
        
        // Check if already on mission
        $currentMission = $player->getCurrentMission();
        if ($currentMission) {
            return ['success' => false, 'message' => 'כבר במשימה פעילה'];
        }
        
        $this->db->beginTransaction();
        
        try {
            // Start mission
            $stmt = $this->db->prepare("
                INSERT INTO player_missions (player_id, mission_id, status, started_at)
                VALUES (?, ?, 'active', datetime('now'))
            ");
            $stmt->execute([$playerId, $missionId]);
            
            // Use energy
            $player->updateEnergy(-$mission['energy_required']);
            
            $this->db->commit();
            
            return [
                'success' => true,
                'message' => "המשימה '{$mission['title_hebrew']}' החלה",
                'mission' => $mission
            ];
            
        } catch (Exception $e) {
            $this->db->rollback();
            return ['success' => false, 'message' => 'שגיאה בהתחלת המשימה'];
        }
    }
    
    private function updateDailyStats($playerId, $stats): void {
        $today = date('Y-m-d');
        
        // Try to update existing record
        $updateFields = [];
        $updateValues = [];
        
        foreach ($stats as $field => $value) {
            $updateFields[] = "$field = $field + ?";
            $updateValues[] = $value;
        }
        
        $updateValues[] = $playerId;
        $updateValues[] = $today;
        
        $stmt = $this->db->prepare("
            INSERT INTO player_stats (player_id, stat_date, " . implode(', ', array_keys($stats)) . ")
            VALUES (?, ?, " . str_repeat('?, ', count($stats) - 1) . "?)
            ON CONFLICT(player_id, stat_date) DO UPDATE SET " . implode(', ', $updateFields)
        ");
        
        $stmt->execute(array_merge([$playerId, $today], array_values($stats), $updateValues));
    }
}
```

### API Endpoints Structure

```php
<?php
// public/api/player/profile.php
header('Content-Type: application/json; charset=utf-8');
session_start();

if (!isset($_SESSION['player_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'לא מחובר למערכת']);
    exit;
}

$player = new Player($_SESSION['player_id']);
$playerData = $player->getData();

// Add current mission info
$currentMission = $player->getCurrentMission();
if ($currentMission) {
    $playerData['current_mission'] = $currentMission;
}

echo json_encode($playerData, JSON_UNESCAPED_UNICODE);

// public/api/missions/start.php
header('Content-Type: application/json; charset=utf-8');
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

if (!isset($_SESSION['player_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'לא מחובר למערכת']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$missionId = $input['mission_id'] ?? null;

if (!$missionId) {
    http_response_code(400);
    echo json_encode(['error' => 'חסר מזהה משימה']);
    exit;
}

$gameEngine = new GameEngine();
$result = $gameEngine->startMission($_SESSION['player_id'], $missionId);

echo json_encode($result, JSON_UNESCAPED_UNICODE);

// public/api/events/stream.php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('Access-Control-Allow-Origin: *');

session_start();

if (!isset($_SESSION['player_id'])) {
    echo "data: " . json_encode(['error' => 'Unauthorized']) . "\n\n";
    exit;
}

$playerId = $_SESSION['player_id'];
$lastEventId = $_GET['lastEventId'] ?? 0;

function sendEvent($data) {
    echo "data: " . json_encode($data, JSON_UNESCAPED_UNICODE) . "\n\n";
    ob_flush();
    flush();
}

// Keep connection alive and send updates
while (true) {
    // Check for mission completions
    $db = Database::getInstance()->getPdo();
    
    $stmt = $db->prepare("
        SELECT pm.id, pm.mission_id, m.title_hebrew, m.duration_minutes, pm.started_at
        FROM player_missions pm
        JOIN missions m ON pm.mission_id = m.id
        WHERE pm.player_id = ? AND pm.status = 'active'
    ");
    
    $stmt->execute([$playerId]);
    $activeMission = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($activeMission) {
        $startTime = new DateTime($activeMission['started_at']);
        $endTime = clone $startTime;
        $endTime->add(new DateInterval('PT' . $activeMission['duration_minutes'] . 'M'));
        
        if (new DateTime() >= $endTime) {
            $gameEngine = new GameEngine();
            $result = $gameEngine->processMissionCompletion($activeMission['id']);
            
            sendEvent([
                'type' => 'mission_complete',
                'mission_id' => $activeMission['mission_id'],
                'result' => $result
            ]);
        }
    }
    
    // Send heartbeat
    sendEvent(['type' => 'heartbeat', 'timestamp' => time()]);
    
    sleep(10); // Check every 10 seconds
}
```

---

## 🔄 Real-time Features Implementation

### Server-Sent Events for Live Updates

```php
<?php
// src/classes/RealTimeManager.php
class RealTimeManager {
    private $db;
    private $redis; // Optional Redis for better performance
    
    public function __construct() {
        $this->db = Database::getInstance()->getPdo();
    }
    
    public function broadcastToUnit($unitId, $message): void {
        $stmt = $this->db->prepare("SELECT id FROM players WHERE unit_id = ? AND is_active = 1");
        $stmt->execute([$unitId]);
        $players = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        foreach ($players as $playerId) {
            $this->sendToPlayer($playerId, $message);
        }
    }
    
    public function broadcastToBase($baseId, $message): void {
        $stmt = $this->db->prepare("SELECT id FROM players WHERE base_id = ? AND is_active = 1");
        $stmt->execute([$baseId]);
        $players = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        foreach ($players as $playerId) {
            $this->sendToPlayer($playerId, $message);
        }
    }
    
    public function sendToPlayer($playerId, $message): void {
        // Store message in temporary table for SSE pickup
        $stmt = $this->db->prepare("
            INSERT OR REPLACE INTO temp.player_events (player_id, event_data, created_at)
            VALUES (?, ?, datetime('now'))
        ");
        $stmt->execute([$playerId, json_encode($message, JSON_UNESCAPED_UNICODE)]);
    }
    
    public function getEventsForPlayer($playerId, $since = null): array {
        $sql = "SELECT event_data FROM temp.player_events WHERE player_id = ?";
        $params = [$playerId];
        
        if ($since) {
            $sql .= " AND created_at > ?";
            $params[] = $since;
        }
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        $events = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $events[] = json_decode($row['event_data'], true);
        }
        
        return $events;
    }
}
```

### Chat System Implementation

```php
<?php
// src/classes/ChatManager.php
class ChatManager {
    private $db;
    private $realTimeManager;
    
    public function __construct() {
        $this->db = Database::getInstance()->getPdo();
        $this->realTimeManager = new RealTimeManager();
    }
    
    public function sendMessage($senderId, $roomType, $roomId, $message): bool {
        // Validate message
        $message = trim(strip_tags($message));
        if (strlen($message) === 0 || strlen($message) > 500) {
            return false;
        }
        
        // Check permissions
        if (!$this->canSendToRoom($senderId, $roomType, $roomId)) {
            return false;
        }
        
        $stmt = $this->db->prepare("
            INSERT INTO chat_messages (sender_id, room_type, room_id, message, created_at)
            VALUES (?, ?, ?, ?, datetime('now'))
        ");
        
        $result = $stmt->execute([$senderId, $roomType, $roomId, $message]);
        
        if ($result) {
            // Get sender info
            $senderStmt = $this->db->prepare("SELECT username, rank_id FROM players WHERE id = ?");
            $senderStmt->execute([$senderId]);
            $sender = $senderStmt->fetch(PDO::FETCH_ASSOC);
            
            // Broadcast to room
            $chatMessage = [
                'type' => 'chat_message',
                'room_type' => $roomType,
                'room_id' => $roomId,
                'sender' => $sender['username'],
                'message' => $message,
                'timestamp' => date('H:i')
            ];
            
            $this->broadcastToRoom($roomType, $roomId, $chatMessage);
        }
        
        return $result;
    }
    
    public function getMessages($roomType, $roomId, $limit = 50): array {
        $stmt = $this->db->prepare("
            SELECT cm.*, p.username, r.name_hebrew as rank_name
            FROM chat_messages cm
            JOIN players p ON cm.sender_id = p.id
            LEFT JOIN ranks r ON p.rank_id = r.id
            WHERE cm.room_type = ? AND cm.room_id = ?
            ORDER BY cm.created_at DESC
            LIMIT ?
        ");
        
        $stmt->execute([$roomType, $roomId, $limit]);
        return array_reverse($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
    
    private function canSendToRoom($playerId, $roomType, $roomId): bool {
        $player = new Player($playerId);
        $playerData = $player->getData();
        
        switch ($roomType) {
            case 'global':
                return true;
            case 'unit':
                return $playerData['unit_id'] == $roomId;
            case 'base':
                return $playerData['base_id'] == $roomId;
            case 'private':
                // Check if players are friends or in same unit
                return $this->arePlayersConnected($playerId, $roomId);
            default:
                return false;
        }
    }
    
    private function broadcastToRoom($roomType, $roomId, $message): void {
        switch ($roomType) {
            case 'global':
                // Broadcast to all active players
                $stmt = $this->db->prepare("SELECT id FROM players WHERE is_active = 1");
                $stmt->execute();
                $players = $stmt->fetchAll(PDO::FETCH_COLUMN);
                foreach ($players as $playerId) {
                    $this->realTimeManager->sendToPlayer($playerId, $message);
                }
                break;
                
            case 'unit':
                $this->realTimeManager->broadcastToUnit($roomId, $message);
                break;
                
            case 'base':
                $this->realTimeManager->broadcastToBase($roomId, $message);
                break;
                
            case 'private':
                $this->realTimeManager->sendToPlayer($roomId, $message);
                break;
        }
    }
}
```

---

## 🚀 Performance Optimization

### Caching Strategy

```php
<?php
// src/classes/CacheManager.php
class CacheManager {
    private $cacheDir;
    private $defaultTTL;
    
    public function __construct($cacheDir = null, $ttl = 3600) {
        $this->cacheDir = $cacheDir ?? __DIR__ . '/../../cache/';
        $this->defaultTTL = $ttl;
        
        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0755, true);
        }
    }
    
    public function get($key): mixed {
        $filename = $this->getCacheFilename($key);
        
        if (!file_exists($filename)) {
            return null;
        }
        
        $data = unserialize(file_get_contents($filename));
        
        if ($data['expires'] < time()) {
            unlink($filename);
            return null;
        }
        
        return $data['value'];
    }
    
    public function set($key, $value, $ttl = null): bool {
        $ttl = $ttl ?? $this->defaultTTL;
        $filename = $this->getCacheFilename($key);
        
        $data = [
            'value' => $value,
            'expires' => time() + $ttl
        ];
        
        return file_put_contents($filename, serialize($data)) !== false;
    }
    
    public function delete($key): bool {
        $filename = $this->getCacheFilename($key);
        
        if (file_exists($filename)) {
            return unlink($filename);
        }
        
        return true;
    }
    
    private function getCacheFilename($key): string {
        return $this->cacheDir . md5($key) . '.cache';
    }
}

// Usage in Player class
public function getData(): array {
    $cache = new CacheManager();
    $cacheKey = "player_data_{$this->data['id']}";
    
    $cachedData = $cache->get($cacheKey);
    if ($cachedData !== null) {
        return $cachedData;
    }
    
    // Fetch fresh data
    $this->load($this->data['id']);
    $cache->set($cacheKey, $this->data, 300); // Cache for 5 minutes
    
    return $this->data;
}
```

### Database Query Optimization

```php
<?php
// src/classes/QueryOptimizer.php
class QueryOptimizer {
    private $db;
    private $queryCache = [];
    
    public function __construct() {
        $this->db = Database::getInstance()->getPdo();
    }
    
    public function getLeaderboard($type = 'experience', $limit = 100): array {
        $cacheKey = "leaderboard_{$type}_{$limit}";
        
        if (isset($this->queryCache[$cacheKey])) {
            return $this->queryCache[$cacheKey];
        }
        
        $validTypes = ['experience', 'money', 'combat_points', 'leadership_points'];
        if (!in_array($type, $validTypes)) {
            $type = 'experience';
        }
        
        $stmt = $this->db->prepare("
            SELECT p.username, p.{$type}, r.name_hebrew as rank_name, u.name_hebrew as unit_name
            FROM players p
            LEFT JOIN ranks r ON p.rank_id = r.id
            LEFT JOIN units u ON p.unit_id = u.id
            WHERE p.is_active = 1
            ORDER BY p.{$type} DESC
            LIMIT ?
        ");
        
        $stmt->execute([$limit]);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Cache for 10 minutes
        $this->queryCache[$cacheKey] = $result;
        
        return $result;
    }
    
    public function getActivePlayersCount(): int {
        $cacheKey = 'active_players_count';
        
        if (isset($this->queryCache[$cacheKey])) {
            return $this->queryCache[$cacheKey];
        }
        
        $stmt = $this->db->prepare("
            SELECT COUNT(*) FROM players 
            WHERE is_active = 1 AND last_login > datetime('now', '-1 hour')
        ");
        
        $stmt->execute();
        $count = $stmt->fetchColumn();
        
        $this->queryCache[$cacheKey] = $count;
        
        return $count;
    }
}
```

---

## 🔒 Security Implementation

### Security Manager

```php
<?php
// src/classes/SecurityManager.php
class SecurityManager {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getPdo();
    }
    
    public function validateSession(): bool {
        if (!isset($_SESSION['player_id']) || !isset($_SESSION['session_token'])) {
            return false;
        }
        
        $stmt = $this->db->prepare("
            SELECT player_id FROM sessions 
            WHERE player_id = ? AND session_token = ? AND expires_at > datetime('now')
        ");
        
        $stmt->execute([$_SESSION['player_id'], $_SESSION['session_token']]);
        return $stmt->fetch() !== false;
    }
    
    public function createSession($playerId): string {
        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
        
        $stmt = $this->db->prepare("
            INSERT OR REPLACE INTO sessions (player_id, session_token, expires_at)
            VALUES (?, ?, ?)
        ");
        
        $stmt->execute([$playerId, $token, $expiresAt]);
        
        $_SESSION['player_id'] = $playerId;
        $_SESSION['session_token'] = $token;
        
        return $token;
    }
    
    public function rateLimit($action, $playerId, $maxAttempts = 10, $windowMinutes = 15): bool {
        $windowStart = date('Y-m-d H:i:s', strtotime("-{$windowMinutes} minutes"));
        
        $stmt = $this->db->prepare("
            SELECT COUNT(*) FROM rate_limits 
            WHERE player_id = ? AND action = ? AND created_at > ?
        ");
        
        $stmt->execute([$playerId, $action, $windowStart]);
        $attempts = $stmt->fetchColumn();
        
        if ($attempts >= $maxAttempts) {
            return false;
        }
        
        // Log attempt
        $logStmt = $this->db->prepare("
            INSERT INTO rate_limits (player_id, action, created_at)
            VALUES (?, ?, datetime('now'))
        ");
        $logStmt->execute([$playerId, $action]);
        
        return true;
    }
    
    public function sanitizeInput($input): string {
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }
    
    public function validateCSRF($token): bool {
        return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }
    
    public function generateCSRF(): string {
        $token = bin2hex(random_bytes(32));
        $_SESSION['csrf_token'] = $token;
        return $token;
    }
}
```

---

## 📊 Analytics and Monitoring

### Analytics Manager

```php
<?php
// src/classes/AnalyticsManager.php
class AnalyticsManager {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getPdo();
    }
    
    public function trackPlayerActivity($playerId, $activity, $data = null): void {
        $stmt = $this->db->prepare("
            INSERT INTO player_activities (player_id, activity, data, created_at)
            VALUES (?, ?, ?, datetime('now'))
        ");
        
        $stmt->execute([
            $playerId, 
            $activity, 
            $data ? json_encode($data, JSON_UNESCAPED_UNICODE) : null
        ]);
    }
    
    public function getPlayerStats($playerId, $days = 7): array {
        $stmt = $this->db->prepare("
            SELECT 
                SUM(missions_completed) as total_missions,
                SUM(energy_used) as total_energy,
                SUM(money_earned) as total_money,
                SUM(xp_gained) as total_xp,
                SUM(time_played_minutes) as total_time
            FROM player_stats 
            WHERE player_id = ? AND stat_date > date('now', '-{$days} days')
        ");
        
        $stmt->execute([$playerId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function getGameStatistics(): array {
        $stats = [];
        
        // Active players
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as count FROM players 
            WHERE last_login > datetime('now', '-24 hours')
        ");
        $stmt->execute();
        $stats['active_24h'] = $stmt->fetchColumn();
        
        // Total missions completed today
        $stmt = $this->db->prepare("
            SELECT COUNT(*) FROM player_missions 
            WHERE status = 'completed' AND completed_at > date('now')
        ");
        $stmt->execute();
        $stats['missions_today'] = $stmt->fetchColumn();
        
        // Money in economy
        $stmt = $this->db->prepare("SELECT SUM(money) FROM players WHERE is_active = 1");
        $stmt->execute();
        $stats['total_money'] = $stmt->fetchColumn();
        
        return $stats;
    }
}
```

---

## 🎯 Deployment Configuration

### Server Requirements & Setup

```apache
# .htaccess for Apache
RewriteEngine On

# Force HTTPS (production only)
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Pretty URLs
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ /api/router.php?path=$1 [QSA,L]

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
</IfModule>

# Compress content
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

### PHP Configuration

```php
<?php
// src/config/config.php
define('APP_ENV', $_ENV['APP_ENV'] ?? 'development');
define('APP_DEBUG', APP_ENV === 'development');

// Database
define('DB_PATH', __DIR__ . '/../../database/golani.db');

// Security
define('SESSION_LIFETIME', 24 * 60 * 60); // 24 hours
define('PASSWORD_MIN_LENGTH', 8);

// Game Settings
define('ENERGY_REGEN_RATE', 1); // Energy points per minute
define('MAX_ENERGY', 100);
define('MAX_HEALTH', 100);

// Rate Limits
define('MAX_MISSIONS_PER_HOUR', 10);
define('MAX_CHAT_MESSAGES_PER_MINUTE', 5);

// Error Reporting
if (APP_DEBUG) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Session Configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', !APP_DEBUG);
ini_set('session.use_only_cookies', 1);
```

---

This technical architecture provides a complete, scalable foundation for the Golani MMORPG using HTML, CSS, PHP, and SQLite. The system is designed to handle multiple concurrent users, real-time features, and provides room for future expansion while maintaining optimal performance and security.