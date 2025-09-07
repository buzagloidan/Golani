// Golani MMORPG - Authentication JavaScript
// Handles login, registration, and session management

class AuthManager {
    constructor() {
        this.apiBase = '/api/auth';
        this.isLoggedIn = false;
        this.currentUser = null;
        
        this.init();
    }
    
    init() {
        this.checkAuthStatus();
        this.setupSessionTimeout();
    }
    
    // Check if user is currently authenticated
    async checkAuthStatus() {
        try {
            const response = await fetch(`${this.apiBase}/status.php`, {
                method: 'GET',
                credentials: 'same-origin'
            });
            
            const result = await response.json();
            
            if (result.success && result.user) {
                this.isLoggedIn = true;
                this.currentUser = result.user;
                this.updateUI();
            } else {
                this.isLoggedIn = false;
                this.currentUser = null;
            }
            
        } catch (error) {
            console.error('Auth status check failed:', error);
        }
    }
    
    // Register new user
    async register(userData) {
        try {
            // Validate data before sending
            const validation = this.validateRegistrationData(userData);
            if (!validation.valid) {
                throw new Error(validation.message);
            }
            
            const response = await fetch(`${this.apiBase}/register.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin',
                body: JSON.stringify(userData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Auto-login after successful registration
                await this.login({
                    username: userData.username,
                    password: userData.password
                });
                
                return { success: true, message: 'ההרשמה הושלמה בהצלחה!' };
            } else {
                throw new Error(result.message || 'שגיאה בהרשמה');
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: error.message };
        }
    }
    
    // Login user
    async login(credentials) {
        try {
            const response = await fetch(`${this.apiBase}/login.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin',
                body: JSON.stringify(credentials)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.isLoggedIn = true;
                this.currentUser = result.user;
                this.updateUI();
                
                // Set session timeout warning
                this.setupSessionTimeout();
                
                return { success: true, message: 'התחברת בהצלחה!' };
            } else {
                throw new Error(result.message || 'שגיאה בהתחברות');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: error.message };
        }
    }
    
    // Logout user
    async logout() {
        try {
            const response = await fetch(`${this.apiBase}/logout.php`, {
                method: 'POST',
                credentials: 'same-origin'
            });
            
            const result = await response.json();
            
            this.isLoggedIn = false;
            this.currentUser = null;
            this.updateUI();
            
            // Redirect to landing page
            window.location.href = '/';
            
        } catch (error) {
            console.error('Logout error:', error);
            // Force logout even if server request failed
            this.isLoggedIn = false;
            this.currentUser = null;
            window.location.href = '/';
        }
    }
    
    // Validate registration data
    validateRegistrationData(data) {
        // Username validation
        if (!data.username || data.username.length < 3 || data.username.length > 20) {
            return { valid: false, message: 'שם המשתמש חייב להיות בין 3-20 תווים' };
        }
        
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(data.username)) {
            return { valid: false, message: 'שם משתמש יכול להכיל רק אותיות, מספרים וקו תחתון' };
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            return { valid: false, message: 'כתובת דוא"ל לא תקינה' };
        }
        
        // Password validation
        if (!data.password || data.password.length < 8) {
            return { valid: false, message: 'הסיסמה חייבת להיות באורך 8 תווים לפחות' };
        }
        
        // Password strength check
        const hasUpper = /[A-Z]/.test(data.password);
        const hasLower = /[a-z]/.test(data.password);
        const hasNumber = /\d/.test(data.password);
        
        if (!(hasUpper && hasLower && hasNumber)) {
            return { valid: false, message: 'הסיסמה חייבת לכלול אות גדולה, אות קטנה ומספר' };
        }
        
        // Password confirmation
        if (data.password !== data.confirm_password) {
            return { valid: false, message: 'הסיסמאות אינן תואמות' };
        }
        
        // Recruitment cycle
        if (!data.recruitment_cycle) {
            return { valid: false, message: 'יש לבחור מחזור גיוס' };
        }
        
        // Terms acceptance
        if (!data.accept_terms) {
            return { valid: false, message: 'יש להסכים לתנאי השימוש' };
        }
        
        return { valid: true };
    }
    
    // Update UI based on auth status
    updateUI() {
        const loginElements = document.querySelectorAll('.login-only');
        const logoutElements = document.querySelectorAll('.logout-only');
        
        if (this.isLoggedIn) {
            loginElements.forEach(el => el.style.display = 'block');
            logoutElements.forEach(el => el.style.display = 'none');
            
            // Update user info display
            this.updateUserInfo();
        } else {
            loginElements.forEach(el => el.style.display = 'none');
            logoutElements.forEach(el => el.style.display = 'block');
        }
    }
    
    // Update user info in UI
    updateUserInfo() {
        if (!this.currentUser) return;
        
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => {
            el.textContent = this.currentUser.username;
        });
        
        const userRankElements = document.querySelectorAll('.user-rank');
        userRankElements.forEach(el => {
            el.textContent = this.currentUser.rank_name || 'טוראי';
        });
    }
    
    // Setup session timeout warning
    setupSessionTimeout() {
        if (!this.isLoggedIn) return;
        
        // Warning 5 minutes before timeout
        setTimeout(() => {
            if (this.isLoggedIn) {
                this.showSessionWarning();
            }
        }, 19 * 60 * 1000); // 19 minutes (assuming 24 min session)
        
        // Auto-logout on timeout
        setTimeout(() => {
            if (this.isLoggedIn) {
                this.handleSessionTimeout();
            }
        }, 24 * 60 * 1000); // 24 minutes
    }
    
    // Show session timeout warning
    showSessionWarning() {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'session-warning';
        warningDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--warning-color), #f8c471);
            color: var(--golani-dark);
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 3000;
            max-width: 350px;
            animation: slideInRight 0.3s ease;
        `;
        
        warningDiv.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px;">
                ⚠️ אזהרת זמן חיבור
            </div>
            <div style="margin-bottom: 15px;">
                החיבור שלך יפוג בעוד 5 דקות. האם אתה רוצה להאריך?
            </div>
            <div style="display: flex; gap: 10px;">
                <button onclick="authManager.extendSession()" style="
                    flex: 1;
                    padding: 8px 16px;
                    background: var(--golani-dark);
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">האריך חיבור</button>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    flex: 1;
                    padding: 8px 16px;
                    background: transparent;
                    color: var(--golani-dark);
                    border: 1px solid var(--golani-dark);
                    border-radius: 5px;
                    cursor: pointer;
                ">סגור</button>
            </div>
        `;
        
        document.body.appendChild(warningDiv);
        
        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (warningDiv.parentNode) {
                warningDiv.remove();
            }
        }, 30000);
    }
    
    // Extend session
    async extendSession() {
        try {
            const response = await fetch(`${this.apiBase}/extend.php`, {
                method: 'POST',
                credentials: 'same-origin'
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Remove warning
                const warning = document.querySelector('.session-warning');
                if (warning) warning.remove();
                
                // Reset timeout
                this.setupSessionTimeout();
                
                this.showMessage('החיבור הוארך בהצלחה', 'success');
            } else {
                throw new Error('שגיאה בהארכת החיבור');
            }
            
        } catch (error) {
            console.error('Session extend error:', error);
            this.showMessage('שגיאה בהארכת החיבור', 'error');
        }
    }
    
    // Handle session timeout
    handleSessionTimeout() {
        this.showMessage('החיבור שלך פג. מתנתק...', 'warning');
        
        setTimeout(() => {
            this.logout();
        }, 2000);
    }
    
    // Show message utility
    showMessage(message, type = 'info') {
        // Use the global showMessage function if available
        if (typeof showMessage === 'function') {
            showMessage(message, type);
            return;
        }
        
        // Fallback message display
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            max-width: 400px;
            z-index: 3000;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            background: var(--${type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'}-color);
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
    
    // Get user data
    getUserData() {
        return this.currentUser;
    }
    
    // Check if user is logged in
    isAuthenticated() {
        return this.isLoggedIn;
    }
}

// Username availability checker
class UsernameChecker {
    constructor() {
        this.cache = new Map();
        this.debounceTimer = null;
    }
    
    async checkAvailability(username) {
        // Check cache first
        if (this.cache.has(username)) {
            return this.cache.get(username);
        }
        
        try {
            const response = await fetch('/api/auth/check-username.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username })
            });
            
            const result = await response.json();
            
            // Cache result for 30 seconds
            this.cache.set(username, result);
            setTimeout(() => {
                this.cache.delete(username);
            }, 30000);
            
            return result;
            
        } catch (error) {
            console.error('Username check error:', error);
            return { available: true }; // Assume available on error
        }
    }
    
    // Debounced username check for real-time validation
    checkWithDebounce(username, callback) {
        clearTimeout(this.debounceTimer);
        
        this.debounceTimer = setTimeout(async () => {
            const result = await this.checkAvailability(username);
            callback(result);
        }, 500); // 500ms delay
    }
}

// Password strength checker
class PasswordStrengthChecker {
    checkStrength(password) {
        let score = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /\d/.test(password),
            symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        };
        
        Object.values(checks).forEach(check => {
            if (check) score++;
        });
        
        let strength = 'weak';
        let color = 'var(--error-color)';
        let message = 'סיסמה חלשה';
        
        if (score >= 4) {
            strength = 'strong';
            color = 'var(--success-color)';
            message = 'סיסמה חזקה';
        } else if (score >= 3) {
            strength = 'medium';
            color = 'var(--warning-color)';
            message = 'סיסמה בינונית';
        }
        
        return {
            score,
            strength,
            color,
            message,
            checks
        };
    }
    
    // Show password strength indicator
    showStrengthIndicator(inputElement, strength) {
        let indicator = inputElement.parentNode.querySelector('.password-strength');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'password-strength';
            indicator.style.cssText = `
                margin-top: 5px;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 10px;
            `;
            inputElement.parentNode.appendChild(indicator);
        }
        
        const bars = Array.from({length: 5}, (_, i) => i < strength.score).map(active => 
            `<div style="
                width: 20px;
                height: 4px;
                background: ${active ? strength.color : 'rgba(255,255,255,0.2)'};
                border-radius: 2px;
            "></div>`
        ).join('');
        
        indicator.innerHTML = `
            <div style="display: flex; gap: 2px;">
                ${bars}
            </div>
            <span style="color: ${strength.color};">${strength.message}</span>
        `;
    }
}

// Initialize auth manager when DOM is loaded
let authManager, usernameChecker, passwordStrengthChecker;

document.addEventListener('DOMContentLoaded', function() {
    authManager = new AuthManager();
    usernameChecker = new UsernameChecker();
    passwordStrengthChecker = new PasswordStrengthChecker();
    
    // Setup real-time username checking
    const usernameInput = document.querySelector('input[name="username"]');
    if (usernameInput) {
        usernameInput.addEventListener('input', function() {
            const username = this.value.trim();
            
            if (username.length >= 3) {
                usernameChecker.checkWithDebounce(username, (result) => {
                    showUsernameAvailability(this, result);
                });
            } else {
                clearUsernameIndicator(this);
            }
        });
    }
    
    // Setup password strength checking
    const passwordInput = document.querySelector('input[name="password"]');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            
            if (password.length > 0) {
                const strength = passwordStrengthChecker.checkStrength(password);
                passwordStrengthChecker.showStrengthIndicator(this, strength);
            } else {
                clearPasswordIndicator(this);
            }
        });
    }
});

// Username availability display
function showUsernameAvailability(inputElement, result) {
    clearUsernameIndicator(inputElement);
    
    const indicator = document.createElement('div');
    indicator.className = 'username-availability';
    indicator.style.cssText = `
        margin-top: 5px;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 5px;
    `;
    
    if (result.available) {
        indicator.innerHTML = `
            <span style="color: var(--success-color);">✓</span>
            <span style="color: var(--success-color);">שם המשתמש זמין</span>
        `;
    } else {
        indicator.innerHTML = `
            <span style="color: var(--error-color);">✗</span>
            <span style="color: var(--error-color);">שם המשתמש תפוס</span>
        `;
    }
    
    inputElement.parentNode.appendChild(indicator);
}

function clearUsernameIndicator(inputElement) {
    const indicator = inputElement.parentNode.querySelector('.username-availability');
    if (indicator) indicator.remove();
}

function clearPasswordIndicator(inputElement) {
    const indicator = inputElement.parentNode.querySelector('.password-strength');
    if (indicator) indicator.remove();
}