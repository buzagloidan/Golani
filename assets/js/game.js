// Golani MMORPG - Game Interface JavaScript

class GameInterface {
    constructor() {
        this.currentSection = 'dashboard';
        this.init();
    }
    
    init() {
        this.setupNavigation();
        this.setupAutoRefresh();
        this.setupKeyboardShortcuts();
    }
    
    // Setup navigation between sections
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                if (section) {
                    this.showSection(section);
                }
            });
        });
    }
    
    // Show specific section
    showSection(sectionName) {
        // Hide all sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Show target section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
            this.currentSection = sectionName;
        }
        
        // Update navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === sectionName) {
                item.classList.add('active');
            }
        });
        
        // Load section-specific content if needed
        this.loadSectionContent(sectionName);
    }
    
    // Load content for specific sections
    loadSectionContent(sectionName) {
        switch (sectionName) {
            case 'missions':
                this.loadMissions();
                break;
            case 'jobs':
                this.loadJobs();
                break;
            case 'bank':
                this.loadBank();
                break;
            case 'units':
                this.loadUnits();
                break;
            case 'chat':
                this.loadChat();
                break;
            case 'profile':
                this.loadProfile();
                break;
        }
    }
    
    // Load missions content
    async loadMissions() {
        const section = document.getElementById('missions-section');
        if (section.getAttribute('data-loaded') === 'true') return;
        
        try {
            const response = await fetch('/api/missions.php');
            const data = await response.json();
            
            if (data.success) {
                this.renderMissions(data.missions);
                section.setAttribute('data-loaded', 'true');
            }
        } catch (error) {
            console.error('Error loading missions:', error);
        }
    }
    
    // Render missions list
    renderMissions(missions) {
        const section = document.getElementById('missions-section');
        section.innerHTML = `
            <div class="section-header">
                <h2>⚔️ משימות זמינות</h2>
                <p>בחר משימה כדי להתחיל ולהרוויח נסיון וכסף</p>
            </div>
            <div class="missions-grid">
                ${missions.map(mission => `
                    <div class="mission-card ${mission.difficulty > 2 ? 'mission-hard' : ''}">
                        <div class="mission-header">
                            <h3>${mission.name}</h3>
                            <span class="mission-type">${mission.type}</span>
                        </div>
                        <div class="mission-content">
                            <p>${mission.description}</p>
                            <div class="mission-stats">
                                <div class="stat">
                                    <span class="stat-label">רמת קושי:</span>
                                    <span class="difficulty-${mission.difficulty}">${'★'.repeat(mission.difficulty)}</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">תגמול:</span>
                                    <span class="reward">${mission.reward_money}₪ + ${mission.reward_experience} נסיון</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">משך:</span>
                                    <span>${Math.floor(mission.duration_minutes / 60)}:${(mission.duration_minutes % 60).toString().padStart(2, '0')}</span>
                                </div>
                            </div>
                            <button class="btn btn-primary" onclick="gameInterface.joinMission(${mission.id})">
                                הצטרף למשימה
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Join a mission
    async joinMission(missionId) {
        try {
            const response = await fetch('/api/join-mission.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mission_id: missionId })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showMessage('הצטרפת למשימה בהצלחה!', 'success');
                this.refreshStats();
                this.loadMissions(); // Refresh missions list
            } else {
                this.showMessage(result.message, 'error');
            }
        } catch (error) {
            console.error('Error joining mission:', error);
            this.showMessage('שגיאה בהצטרפות למשימה', 'error');
        }
    }
    
    // Setup auto-refresh for stats
    setupAutoRefresh() {
        // Refresh stats every 30 seconds
        setInterval(() => {
            this.refreshStats();
        }, 30000);
        
        // Refresh online count every 60 seconds
        setInterval(() => {
            this.refreshOnlineCount();
        }, 60000);
    }
    
    // Refresh player stats
    async refreshStats() {
        try {
            const response = await fetch('/api/player-stats.php');
            const data = await response.json();
            
            if (data.success) {
                this.updateStatsDisplay(data.stats);
            }
        } catch (error) {
            console.error('Error refreshing stats:', error);
        }
    }
    
    // Update stats display
    updateStatsDisplay(stats) {
        // Update header stats
        const statValues = document.querySelectorAll('.stat-value');
        if (statValues.length >= 4) {
            statValues[0].textContent = this.formatNumber(stats.money);
            statValues[1].textContent = this.formatNumber(stats.experience);
            statValues[2].textContent = stats.health;
            statValues[3].textContent = stats.energy;
        }
        
        // Update progress bar if visible
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill && stats.progress !== undefined) {
            progressFill.style.width = `${stats.progress}%`;
        }
    }
    
    // Refresh online count
    async refreshOnlineCount() {
        try {
            const response = await fetch('/api/online-count.php');
            const data = await response.json();
            
            if (data.success) {
                const onlineCountEl = document.querySelector('.online-count');
                if (onlineCountEl) {
                    onlineCountEl.textContent = data.count;
                }
            }
        } catch (error) {
            console.error('Error refreshing online count:', error);
        }
    }
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) return; // Ignore ctrl/cmd combinations
            
            switch (e.key) {
                case '1':
                    this.showSection('dashboard');
                    break;
                case '2':
                    this.showSection('missions');
                    break;
                case '3':
                    this.showSection('jobs');
                    break;
                case '4':
                    this.showSection('bank');
                    break;
                case '5':
                    this.showSection('units');
                    break;
                case '6':
                    this.showSection('chat');
                    break;
                case '7':
                    this.showSection('profile');
                    break;
            }
        });
    }
    
    // Utility function to format numbers
    formatNumber(num) {
        return new Intl.NumberFormat('he-IL').format(num);
    }
    
    // Show message utility
    showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = `game-message game-message--${type}`;
        messageEl.textContent = message;
        
        messageEl.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            max-width: 400px;
            text-align: right;
            direction: rtl;
            font-family: 'Noto Sans Hebrew', sans-serif;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease;
        `;
        
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        messageEl.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 5000);
    }
    
    // Placeholder methods for other sections
    loadJobs() {
        const section = document.getElementById('jobs-section');
        section.innerHTML = `
            <div class="section-header">
                <h2>💼 עבודות זמינות</h2>
                <p>מערכת העבודות בפיתוח - בקרוב!</p>
            </div>
        `;
    }
    
    loadBank() {
        const section = document.getElementById('bank-section');
        section.innerHTML = `
            <div class="section-header">
                <h2>🏦 בנק גולני</h2>
                <p>מערכת הבנק בפיתוח - בקרוב!</p>
            </div>
        `;
    }
    
    loadUnits() {
        const section = document.getElementById('units-section');
        section.innerHTML = `
            <div class="section-header">
                <h2>👥 יחידות צבאיות</h2>
                <p>מערכת היחידות בפיתוח - בקרוב!</p>
            </div>
        `;
    }
    
    loadChat() {
        const section = document.getElementById('chat-section');
        section.innerHTML = `
            <div class="section-header">
                <h2>💬 צ'אט גולני</h2>
                <p>מערכת הצ'אט בפיתוח - בקרוב!</p>
            </div>
        `;
    }
    
    loadProfile() {
        const section = document.getElementById('profile-section');
        section.innerHTML = `
            <div class="section-header">
                <h2>👤 פרופיל חייל</h2>
                <p>עמוד הפרופיל בפיתוח - בקרוב!</p>
            </div>
        `;
    }
}

// Initialize game interface when DOM is ready
let gameInterface;

document.addEventListener('DOMContentLoaded', function() {
    gameInterface = new GameInterface();
});

// Global function for showing sections (used by onclick handlers)
function showSection(sectionName) {
    if (gameInterface) {
        gameInterface.showSection(sectionName);
    }
}

// Add CSS animations
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
    
    .missions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 1.5rem;
        margin-top: 2rem;
    }
    
    .mission-card {
        background: white;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        overflow: hidden;
        border: 1px solid #e0e0e0;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .mission-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    }
    
    .mission-hard {
        border-right: 4px solid #dc3545;
    }
    
    .mission-header {
        background: var(--golani-dark);
        color: white;
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .mission-header h3 {
        margin: 0;
        font-size: 1.2rem;
    }
    
    .mission-type {
        background: var(--golani-gold);
        color: var(--golani-dark);
        padding: 0.25rem 0.75rem;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: bold;
    }
    
    .mission-content {
        padding: 1.5rem;
    }
    
    .mission-stats {
        margin: 1rem 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .stat {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        background: #f8f9fa;
        border-radius: 5px;
    }
    
    .stat-label {
        font-weight: 500;
        color: #666;
    }
    
    .difficulty-1 { color: #28a745; }
    .difficulty-2 { color: #ffc107; }
    .difficulty-3 { color: #fd7e14; }
    .difficulty-4 { color: #dc3545; }
    .difficulty-5 { color: #6f42c1; }
    
    .reward {
        font-weight: bold;
        color: var(--golani-gold);
    }
`;
document.head.appendChild(style);