-- Golani MMORPG Database Schema

-- Players table
CREATE TABLE IF NOT EXISTS players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rank_id INT DEFAULT 1,
    recruitment_cycle VARCHAR(50) NOT NULL,
    money DECIMAL(10,2) DEFAULT 1000.00,
    experience INT DEFAULT 0,
    level INT DEFAULT 1,
    health INT DEFAULT 100,
    energy INT DEFAULT 100,
    unit_id INT NULL,
    job_id INT NULL,
    location VARCHAR(50) DEFAULT 'בסיס גולני הראשי',
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Ranks table
CREATE TABLE IF NOT EXISTS ranks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    name_hebrew VARCHAR(50) NOT NULL,
    level INT NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    required_experience INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    name_hebrew VARCHAR(50) NOT NULL,
    hourly_wage DECIMAL(10,2) NOT NULL,
    description TEXT,
    required_rank INT DEFAULT 1,
    max_workers INT DEFAULT 10,
    current_workers INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Units table
CREATE TABLE IF NOT EXISTS units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('פלוגה', 'פלגה', 'יחידה מיוחדת') NOT NULL,
    commander_id INT NULL,
    max_members INT DEFAULT 50,
    current_members INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (commander_id) REFERENCES players(id)
);

-- Missions table
CREATE TABLE IF NOT EXISTS missions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type ENUM('התקפה', 'הגנה', 'סיור', 'אימון') NOT NULL,
    difficulty INT DEFAULT 1,
    reward_money DECIMAL(10,2) DEFAULT 0,
    reward_experience INT DEFAULT 10,
    duration_minutes INT DEFAULT 60,
    required_rank INT DEFAULT 1,
    max_participants INT DEFAULT 10,
    status ENUM('זמין', 'פעיל', 'הושלם') DEFAULT 'זמין',
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mission participants
CREATE TABLE IF NOT EXISTS mission_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mission_id INT NOT NULL,
    player_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    UNIQUE KEY unique_participant (mission_id, player_id)
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    channel ENUM('כללי', 'יחידה', 'פלוגה') DEFAULT 'כללי',
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- Bank accounts
CREATE TABLE IF NOT EXISTS bank_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT UNIQUE NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    savings DECIMAL(15,2) DEFAULT 0.00,
    loan_amount DECIMAL(15,2) DEFAULT 0.00,
    loan_interest DECIMAL(5,2) DEFAULT 0.00,
    insurance_active BOOLEAN DEFAULT FALSE,
    insurance_monthly DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- Transactions log
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    type ENUM('הכנסה', 'הוצאה', 'הפקדה', 'משיכה', 'הלוואה', 'החזר הלוואה') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255),
    balance_before DECIMAL(15,2),
    balance_after DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10) DEFAULT '🏅',
    points INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player achievements
CREATE TABLE IF NOT EXISTS player_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    achievement_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_achievement (player_id, achievement_id)
);

-- Foreign key constraints
ALTER TABLE players ADD FOREIGN KEY (rank_id) REFERENCES ranks(id);
ALTER TABLE players ADD FOREIGN KEY (unit_id) REFERENCES units(id);
ALTER TABLE players ADD FOREIGN KEY (job_id) REFERENCES jobs(id);