// Golani MMORPG - Main JavaScript
// Landing Page Interactive Elements

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    startAnimations();
    updateStats();
});

// Page Initialization
function initializePage() {
    // Add loading animation to body
    document.body.classList.add('loading');
    
    // Remove loading class after page is fully loaded
    window.addEventListener('load', function() {
        setTimeout(() => {
            document.body.classList.remove('loading');
        }, 500);
    });
    
    // Initialize scroll reveal animations
    initScrollReveal();
    
    // Initialize counter animations
    initCounters();
}

// Event Listeners Setup
function setupEventListeners() {
    // Modal controls
    setupModalControls();
    
    // Form handling
    setupForms();
    
    // Navigation
    setupNavigation();
    
    // Stats update interval
    setInterval(updateStats, 30000); // Update every 30 seconds
}

// Modal Controls
function setupModalControls() {
    // Close modals when clicking outside
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const openModal = document.querySelector('.modal[style*="block"]');
            if (openModal) {
                closeModal(openModal.id);
            }
        }
    });
}

// Show Register Modal
function showRegister() {
    closeAllModals();
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = modal.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 300);
    }
}

// Show Login Modal
function showLogin() {
    closeAllModals();
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = modal.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 300);
    }
}

// Close Modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Clear form if it exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            clearFormErrors(form);
        }
    }
}

// Close All Modals
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = 'auto';
}

// Form Handling
function setupForms() {
    // Registration form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
        
        // Real-time validation
        setupFormValidation(registerForm);
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        
        // Real-time validation
        setupFormValidation(loginForm);
    }
}

// Form Validation Setup
function setupFormValidation(form) {
    const inputs = form.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
    
    // Password confirmation
    const password = form.querySelector('[name="password"]');
    const confirmPassword = form.querySelector('[name="confirm_password"]');
    
    if (password && confirmPassword) {
        confirmPassword.addEventListener('blur', function() {
            validatePasswordMatch(password, confirmPassword);
        });
    }
}

// Field Validation
function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const name = field.name;
    
    clearFieldError(field);
    
    // Required field check
    if (field.required && !value) {
        showFieldError(field, 'שדה חובה');
        return false;
    }
    
    // Email validation
    if (type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'כתובת דוא"ל לא תקינה');
            return false;
        }
    }
    
    // Username validation
    if (name === 'username' && value) {
        if (value.length < 3 || value.length > 20) {
            showFieldError(field, 'שם המשתמש חייב להיות בין 3-20 תווים');
            return false;
        }
        
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(value)) {
            showFieldError(field, 'שם משתמש יכול להכיל רק אותיות, מספרים וקו תחתון');
            return false;
        }
    }
    
    // Password validation
    if (name === 'password' && value) {
        if (value.length < 8) {
            showFieldError(field, 'הסיסמה חייבת להיות באורך 8 תווים לפחות');
            return false;
        }
        
        // Check password strength
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        
        if (!(hasUpper && hasLower && hasNumber)) {
            showFieldError(field, 'הסיסמה חייבת לכלול אות גדולה, אות קטנה ומספר');
            return false;
        }
    }
    
    return true;
}

// Password Match Validation
function validatePasswordMatch(password, confirmPassword) {
    if (password.value && confirmPassword.value && password.value !== confirmPassword.value) {
        showFieldError(confirmPassword, 'הסיסמאות אינן תואמות');
        return false;
    }
    
    clearFieldError(confirmPassword);
    return true;
}

// Show Field Error
function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = 'var(--error-color)';
    errorDiv.style.fontSize = '14px';
    errorDiv.style.marginTop = '5px';
    
    field.parentNode.appendChild(errorDiv);
}

// Clear Field Error
function clearFieldError(field) {
    field.classList.remove('error');
    
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Clear Form Errors
function clearFormErrors(form) {
    const errors = form.querySelectorAll('.field-error');
    errors.forEach(error => error.remove());
    
    const errorFields = form.querySelectorAll('.error');
    errorFields.forEach(field => field.classList.remove('error'));
}

// Handle Registration
async function handleRegistration(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Validate form
    let isValid = true;
    const inputs = form.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    // Check password match
    if (!validatePasswordMatch(
        form.querySelector('[name="password"]'),
        form.querySelector('[name="confirm_password"]')
    )) {
        isValid = false;
    }
    
    // Check terms acceptance
    if (!form.querySelector('[name="accept_terms"]').checked) {
        showMessage('יש להסכים לתנאי השימוש', 'error');
        isValid = false;
    }
    
    if (!isValid) {
        return;
    }
    
    // Show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'נרשם...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/auth/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('ההרשמה בוצעה בהצלחה! מתחבר...', 'success');
            
            setTimeout(() => {
                window.location.href = '/game.php';
            }, 2000);
        } else {
            showMessage(result.message || 'שגיאה בהרשמה', 'error');
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('שגיאה בחיבור לשרת', 'error');
    }
    
    // Reset button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
}

// Handle Login
async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Validate required fields
    let isValid = true;
    const inputs = form.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        return;
    }
    
    // Show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'מתחבר...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/auth/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('התחברות בוצעה בהצלחה!', 'success');
            
            setTimeout(() => {
                window.location.href = '/game.php';
            }, 1500);
        } else {
            showMessage(result.message || 'שגיאה בהתחברות', 'error');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showMessage('שגיאה בחיבור לשרת', 'error');
    }
    
    // Reset button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
}

// Navigation Setup
function setupNavigation() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Active navigation highlighting
    window.addEventListener('scroll', updateActiveNavigation);
}

// Update Active Navigation
function updateActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

// Show Message
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.temp-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type} temp-message`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        max-width: 400px;
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 300);
    }, 5000);
}

// Start Animations
function startAnimations() {
    // Animate counters on page load
    setTimeout(() => {
        animateCounters();
    }, 1000);
    
    // Floating animation for hero elements
    startFloatingAnimations();
}

// Counter Animation
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/,/g, ''));
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60 FPS
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            counter.textContent = Math.floor(current).toLocaleString('he-IL');
        }, 16);
    });
}

// Floating Animations
function startFloatingAnimations() {
    const floatingElements = document.querySelectorAll('.hero-img, .card-icon');
    
    floatingElements.forEach((element, index) => {
        element.style.animation = `float ${3 + index * 0.5}s ease-in-out infinite`;
    });
}

// Scroll Reveal
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.about-card, .feature-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.2
    });
    
    revealElements.forEach(element => {
        element.classList.add('scroll-reveal');
        observer.observe(element);
    });
}

// Update Statistics
async function updateStats() {
    try {
        const response = await fetch('/api/stats/live.php');
        const stats = await response.json();
        
        if (stats.success) {
            updateStatDisplay('online-players', stats.data.online_players);
            // Update other stats as needed
        }
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Update Stat Display
function updateStatDisplay(elementId, newValue) {
    const element = document.getElementById(elementId);
    if (element) {
        const currentValue = parseInt(element.textContent.replace(/,/g, ''));
        
        if (currentValue !== newValue) {
            animateStatChange(element, currentValue, newValue);
        }
    }
}

// Animate Stat Change
function animateStatChange(element, from, to) {
    const duration = 1000;
    const step = (to - from) / (duration / 16);
    let current = from;
    
    const timer = setInterval(() => {
        current += step;
        
        if ((step > 0 && current >= to) || (step < 0 && current <= to)) {
            current = to;
            clearInterval(timer);
        }
        
        element.textContent = Math.floor(current).toLocaleString('he-IL');
    }, 16);
}

// Show Forgot Password (placeholder)
function showForgotPassword() {
    showMessage('תכונת שחזור סיסמה תהיה זמינה בקרוב', 'info');
}

// CSS Animation Definitions
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes float {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }
    
    .nav-link.active {
        background: var(--golani-primary) !important;
        color: white !important;
    }
    
    .field-error {
        animation: shake 0.5s ease;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    input.error {
        border-color: var(--error-color) !important;
        box-shadow: 0 0 10px rgba(231, 76, 60, 0.3) !important;
    }
    
    .loading body::before {
        content: '';
        position: fixed;
        top: 0;
        right: 0;
        width: 100%;
        height: 100%;
        background: var(--golani-dark);
        z-index: 9999;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.5s ease;
    }
`;

document.head.appendChild(style);