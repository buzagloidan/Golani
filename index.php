<?php
session_start();

// Check if user is logged in
$isLoggedIn = isset($_SESSION['player_id']);
$playerName = $_SESSION['player_name'] ?? '';
?>
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>גולני - משחק MMORPG צבאי</title>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="stylesheet" href="assets/css/landing.css">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@300;400;500;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Header Navigation -->
    <header class="main-header">
        <nav class="navbar">
            <div class="nav-container">
                <div class="nav-logo">
                    <!-- <img src="assets/images/golani-logo.png" alt="גדוד גולני" class="logo-img"> -->
                    <h1 class="logo-text">גולני</h1>
                </div>
                
                <div class="nav-links">
                    <?php if (!$isLoggedIn): ?>
                        <a href="#about" class="nav-link">אודות המשחק</a>
                        <a href="#features" class="nav-link">תכונות</a>
                        <a href="#register" class="nav-link register-btn">הרשמה</a>
                        <a href="#login" class="nav-link login-btn">התחברות</a>
                    <?php else: ?>
                        <span class="welcome-text">שלום, <?php echo htmlspecialchars($playerName); ?></span>
                        <a href="game.php" class="nav-link game-btn">למשחק</a>
                        <a href="logout.php" class="nav-link">יציאה</a>
                    <?php endif; ?>
                </div>
            </div>
        </nav>
    </header>

    <!-- Hero Section -->
    <main class="main-content">
        <section class="hero">
            <div class="hero-background">
                <div class="hero-overlay"></div>
            </div>
            
            <div class="hero-content">
                <div class="hero-text">
                    <h1 class="hero-title">
                        <span class="title-main">גדוד גולני</span>
                        <span class="title-sub">משחק MMORPG צבאי</span>
                    </h1>
                    
                    <p class="hero-description">
                        חווה את החיים הצבאיים בגדוד גולני במשחק MMORPG מקיף.
                        התקדם בדרגות, השתתף במשימות, עבוד במגוון תפקידים
                        ובנה את הקריירה הצבאية שלך יחד עם אלפי חיילים אחרים.
                    </p>
                    
                    <div class="hero-stats">
                        <div class="stat-item">
                            <div class="stat-number" id="online-players">247</div>
                            <div class="stat-label">חיילים מחוברים</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">1,843</div>
                            <div class="stat-label">רשומים היום</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">12,566</div>
                            <div class="stat-label">משימות הושלמו</div>
                        </div>
                    </div>
                    
                    <?php if (!$isLoggedIn): ?>
                        <div class="hero-actions">
                            <button class="btn btn-primary btn-large" onclick="showRegister()">
                                התחל לשחק עכשיו
                            </button>
                            <button class="btn btn-secondary btn-large" onclick="showLogin()">
                                יש לי כבר חשבון
                            </button>
                        </div>
                    <?php else: ?>
                        <div class="hero-actions">
                            <a href="game.php" class="btn btn-primary btn-large">
                                המשך לשחק
                            </a>
                        </div>
                    <?php endif; ?>
                </div>
                
                <div class="hero-image">
                    <!-- <img src="assets/images/soldier-hero.png" alt="חייל גולני" class="hero-img"> -->
                </div>
            </div>
        </section>

        <!-- About Section -->
        <section id="about" class="section about-section">
            <div class="container">
                <h2 class="section-title">אודות המשחק</h2>
                
                <div class="about-grid">
                    <div class="about-card">
                        <div class="card-icon">🎖️</div>
                        <h3 class="card-title">מערכת דרגות מלאה</h3>
                        <p class="card-description">
                            התקדם מטוראי ועד רס"ן, כל דרגה עם הטבות ואחריות ייחודיות.
                            בנה את הקריירה הצבאית שלך צעד אחר צעד.
                        </p>
                    </div>
                    
                    <div class="about-card">
                        <div class="card-icon">⚔️</div>
                        <h3 class="card-title">משימות ומבצעים</h3>
                        <p class="card-description">
                            השתתף במשימות התקפיות והגנתיות, סיורים, אימונים ומבצעים מיוחדים.
                            כל משימה מתגמלת בניסיון וכסף.
                        </p>
                    </div>
                    
                    <div class="about-card">
                        <div class="card-icon">👥</div>
                        <h3 class="card-title">חיי יחידה</h3>
                        <p class="card-description">
                            הצטרף ליחידות, פלוגות ופלגות. עבוד יחד עם חיילים אחרים,
                            השתתף בתחרויות בין-יחידתיות ובנה חברויות.
                        </p>
                    </div>
                    
                    <div class="about-card">
                        <div class="card-icon">💼</div>
                        <h3 class="card-title">מערכת עבודות</h3>
                        <p class="card-description">
                            עבוד כטבח, מחסנאי, קשר, רדאר או מדריך. כל עבודה מציעה
                            הכנסה שונה ומסלול התפתחות ייחודי.
                        </p>
                    </div>
                    
                    <div class="about-card">
                        <div class="card-icon">🏦</div>
                        <h3 class="card-title">מערכת בנקאית</h3>
                        <p class="card-description">
                            נהל את הכספים שלך בבנק הצבאי, קבל הלוואות, חסוך לקצונה
                            ורכוש ביטוח צבאי להגנה מפני פציעות.
                        </p>
                    </div>
                    
                    <div class="about-card">
                        <div class="card-icon">🏅</div>
                        <h3 class="card-title">הישגים ותגמולים</h3>
                        <p class="card-description">
                            זכה באותות גבורה, תעודות הצטיינות ותארי כבוד.
                            השתתף בתחרויות והיכנס לטבלת המובילים.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section id="features" class="section features-section">
            <div class="container">
                <h2 class="section-title">תכונות המשחק</h2>
                
                <div class="features-grid">
                    <div class="feature-item">
                        <h3>מחזורי גיוס אמיתיים</h3>
                        <p>מחזור הגיוס שלך נקבע לפי תאריך ההרשמה - אוגוסט 2025, ספטמבר 2025 ועוד</p>
                    </div>
                    
                    <div class="feature-item">
                        <h3>בסיסים צבאיים מגוונים</h3>
                        <p>בסיס גולני הראשי, בסיס אימונים, בסיס חירום, בית חולים צבאי ומחנה מעצר</p>
                    </div>
                    
                    <div class="feature-item">
                        <h3>מצבי משחק מרובים</h3>
                        <p>מצב התקפה עם פשיטות ומבצעים, מצב הגנה עם שמירות וסיורים</p>
                    </div>
                    
                    <div class="feature-item">
                        <h3>צ'אט בזמן אמת</h3>
                        <p>תקשורת מיידית עם חברי היחידה, הבסיס והחיילים ברחבי הארץ</p>
                    </div>
                    
                    <div class="feature-item">
                        <h3>מערכת כלכלית מפותחת</h3>
                        <p>ש"ח צבאי, נקודות גבורה ואסימוני יחידה למגוון רכישות והשקעות</p>
                    </div>
                    
                    <div class="feature-item">
                        <h3>אירועים מיוחדים</h3>
                        <p>חגיגות יום הזיכרון, יום העצמאות, ערבי יחידה ותחרויות חודשיות</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Registration Modal -->
        <div id="registerModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>הרשמה למשחק גולני</h2>
                    <span class="close" onclick="closeModal('registerModal')">&times;</span>
                </div>
                
                <form id="registerForm" class="auth-form">
                    <div class="form-group">
                        <label for="reg-username">שם משתמש</label>
                        <input type="text" id="reg-username" name="username" required minlength="3" maxlength="20">
                        <small>3-20 תווים, אותיות ומספרים בלבד</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="reg-email">כתובת דוא"ל</label>
                        <input type="email" id="reg-email" name="email" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="reg-password">סיסמה</label>
                        <input type="password" id="reg-password" name="password" required minlength="8">
                        <small>לפחות 8 תווים</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="reg-confirm-password">אישור סיסמה</label>
                        <input type="password" id="reg-confirm-password" name="confirm_password" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="recruitment-cycle">מחזור גיוס</label>
                        <select id="recruitment-cycle" name="recruitment_cycle" required>
                            <option value="">בחר מחזור גיוס</option>
                            <option value="September_2025">ספטמבר 2025</option>
                            <option value="October_2025">אוקטובר 2025</option>
                            <option value="November_2025">נובמבר 2025</option>
                            <option value="December_2025">דצמבר 2025</option>
                            <option value="January_2026">ינואר 2026</option>
                        </select>
                    </div>
                    
                    <div class="form-group checkbox-group">
                        <label>
                            <input type="checkbox" id="accept-terms" name="accept_terms" required>
                            אני מסכים לתנאי השימוש ולמדיניות הפרטיות
                        </label>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary btn-full">הרשם למשחק</button>
                        <button type="button" class="btn btn-secondary" onclick="closeModal('registerModal')">ביטול</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Login Modal -->
        <div id="loginModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>התחברות למשחק גולני</h2>
                    <span class="close" onclick="closeModal('loginModal')">&times;</span>
                </div>
                
                <form id="loginForm" class="auth-form">
                    <div class="form-group">
                        <label for="login-username">שם משתמש או דוא"ל</label>
                        <input type="text" id="login-username" name="username" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="login-password">סיסמה</label>
                        <input type="password" id="login-password" name="password" required>
                    </div>
                    
                    <div class="form-group checkbox-group">
                        <label>
                            <input type="checkbox" id="remember-me" name="remember_me">
                            זכור אותי
                        </label>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary btn-full">התחבר</button>
                        <button type="button" class="btn btn-secondary" onclick="closeModal('loginModal')">ביטול</button>
                    </div>
                    
                    <div class="form-links">
                        <a href="#" onclick="showForgotPassword()">שכחתי סיסמה</a>
                        <a href="#" onclick="showRegister()">אין לי חשבון - הרשמה</a>
                    </div>
                </form>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="main-footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>גולני MMORPG</h3>
                    <p>משחק מקוון מרובה משתתפים העוסק בחיים הצבאיים בגדוד גולני</p>
                </div>
                
                <div class="footer-section">
                    <h4>קישורים</h4>
                    <ul>
                        <li><a href="#about">אודות</a></li>
                        <li><a href="#features">תכונות</a></li>
                        <li><a href="rules.php">חוקי המשחק</a></li>
                        <li><a href="help.php">עזרה</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h4>קהילה</h4>
                    <ul>
                        <li><a href="forum.php">פורום</a></li>
                        <li><a href="rankings.php">טבלת דירוגים</a></li>
                        <li><a href="events.php">אירועים</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h4>יצירת קשר</h4>
                    <ul>
                        <li><a href="contact.php">צור קשר</a></li>
                        <li><a href="report.php">דיווח על בעיה</a></li>
                        <li><a href="suggestions.php">הצעות לשיפור</a></li>
                    </ul>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; 2025 גולני MMORPG. כל הזכויות שמורות.</p>
            </div>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="assets/js/main.js"></script>
    <script src="assets/js/auth.js"></script>
</body>
</html>