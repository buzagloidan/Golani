<?php
session_start();

// Clear all session variables
$_SESSION = array();

// Destroy the session cookie
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Clear remember me cookie
setcookie('remember_token', '', time() - 3600, '/', '', true, true);

// Destroy session
session_destroy();

// Redirect to homepage
header("Location: /index.php");
exit;
?>