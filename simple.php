<?php
// Simple version without sessions for testing
$isLoggedIn = false;
$playerName = '';
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
    <header class="main-header">
        <nav class="navbar">
            <div class="nav-container">
                <div class="nav-logo">
                    <img src="assets/images/golani-logo.png" alt="גדוד גולני" class="logo-img">
                    <h1 class="logo-text">גולני</h1>
                </div>
                
                <div class="nav-links">
                    <a href="#about" class="nav-link">אודות המשחק</a>
                    <a href="#features" class="nav-link">תכונות</a>
                    <a href="#register" class="nav-link register-btn">הרשמה</a>
                    <a href="#login" class="nav-link login-btn">התחברות</a>
                </div>
            </div>
        </nav>
    </header>

    <main class="main-content">
        <section class="hero">
            <div class="hero-content">
                <div class="hero-text">
                    <h1 class="hero-title">
                        <span class="title-main">גדוד גולני</span>
                        <span class="title-sub">משחק MMORPG צבאי</span>
                    </h1>
                    
                    <p class="hero-description">
                        חווה את החיים הצבאיים בגדוד גולני במשחק MMORPG מקיף.
                    </p>
                    
                    <div class="hero-actions">
                        <button class="btn btn-primary btn-large">
                            התחל לשחק עכשיו
                        </button>
                    </div>
                </div>
                
                <div class="hero-image">
                    <img src="assets/images/soldier-hero.png" alt="חייל גולני" class="hero-img">
                </div>
            </div>
        </section>
    </main>
</body>
</html>