// Authentication JavaScript functions
document.addEventListener('DOMContentLoaded', function() {
    // Modal functionality
    const registerModal = document.getElementById('registerModal');
    const loginModal = document.getElementById('loginModal');
    
    // Form handlers
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

function showRegister() {
    document.getElementById('registerModal').style.display = 'block';
    document.getElementById('loginModal').style.display = 'none';
}

function showLogin() {
    document.getElementById('loginModal').style.display = 'block';
    document.getElementById('registerModal').style.display = 'none';
}

function showForgotPassword() {
    alert('נא פנה למנהל המערכת לאיפוס סיסמה');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm_password');
    
    // Client-side validation
    if (password !== confirmPassword) {
        showMessage('הסיסמאות אינן תואמות', 'error');
        return;
    }
    
    // Show loading
    showMessage('מבצע רישום...', 'info');
    
    try {
        const response = await fetch('/auth/register.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage(result.message, 'success');
            closeModal('registerModal');
            setTimeout(() => {
                window.location.href = result.redirect;
            }, 2000);
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('שגיאה בתקשורת עם השרת', 'error');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    // Show loading
    showMessage('מתחבר...', 'info');
    
    try {
        const response = await fetch('/auth/login.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage(result.message, 'success');
            closeModal('loginModal');
            setTimeout(() => {
                window.location.href = result.redirect;
            }, 2000);
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('שגיאה בתקשורת עם השרת', 'error');
    }
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.auth-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `auth-message auth-message--${type}`;
    messageEl.textContent = message;
    
    // Style the message
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        max-width: 400px;
        text-align: right;
        direction: rtl;
        font-family: 'Noto Sans Hebrew', sans-serif;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8'
    };
    messageEl.style.backgroundColor = colors[type] || colors.info;
    
    // Add to page
    document.body.appendChild(messageEl);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.parentNode.removeChild(messageEl);
        }
    }, 5000);
}