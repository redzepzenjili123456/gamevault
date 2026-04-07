const API_URL = 'http://localhost:3000';
let currentUser = null;

function loadSession() {
    const saved = localStorage.getItem('gameUser');
    if (saved) {
        try {
            const user = JSON.parse(saved);
            if (user.email && user.name && Date.now() - user.timestamp < 86400000) {
                currentUser = user;
                localStorage.setItem("username", user.name);
                localStorage.setItem("userEmail", user.email);
                return true;
            }
        } catch(e) {}
    }
    
    const username = localStorage.getItem("username");
    const email = localStorage.getItem("userEmail");
    if (username && email) {
        currentUser = { name: username, email: email, timestamp: Date.now() };
        localStorage.setItem('gameUser', JSON.stringify(currentUser));
        return true;
    }
    return false;
}

function saveSession(email, name) {
    currentUser = { email, name, timestamp: Date.now() };
    localStorage.setItem('gameUser', JSON.stringify(currentUser));
    localStorage.setItem("username", name);
    localStorage.setItem("userEmail", email);
}

function clearSession() {
    currentUser = null;
    localStorage.removeItem('gameUser');
    localStorage.removeItem("username");
    localStorage.removeItem("userEmail");
}

function showMessage(msg, isError = false) {
    const msgDiv = document.getElementById('message');
    if (msgDiv) {
        msgDiv.textContent = msg;
        msgDiv.className = isError ? 'message error' : 'message success';
        setTimeout(() => {
            if (msgDiv.textContent === msg) {
                msgDiv.className = 'message';
            }
        }, 5000);
    }
}

function redirectToLobby() {
    window.location.href = 'lobby.html';
}

// index.html логика
if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
    document.addEventListener('DOMContentLoaded', () => {
        if (loadSession()) {
            redirectToLobby();
            return;
        }
        
        const sendBtn = document.getElementById('sendCodeBtn');
        const verifyBtn = document.getElementById('verifyBtn');
        const emailInput = document.getElementById('email');
        const usernameInput = document.getElementById('username');
        const codeInput = document.getElementById('code');
        const codeSection = document.getElementById('codeSection');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', async () => {
                const email = emailInput.value.trim();
                const username = usernameInput.value.trim();
                
                if (!email || !email.includes('@')) {
                    showMessage('❌ Внеси валидна е-пошта', true);
                    return;
                }
                if (!username || username.length < 2) {
                    showMessage('❌ Внеси го вашето име', true);
                    return;
                }
                
                showMessage('📧 Испраќам код...', false);
                
                try {
                    const response = await fetch(`${API_URL}/send-code`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, username })
                    });
                    const data = await response.json();
                    
                    if (data.success) {
                        showMessage(`✅ Кодот е испратен на ${email}!`, false);
                        codeSection.style.display = 'block';
                        codeInput.focus();
                    } else {
                        showMessage(`❌ ${data.message}`, true);
                    }
                } catch (error) {
                    showMessage('❌ Серверот не работи! Стартувајте "node server.js"', true);
                }
            });
        }
        
        if (verifyBtn) {
            verifyBtn.addEventListener('click', async () => {
                const email = emailInput.value.trim();
                const code = codeInput.value.trim();
                
                if (!email || !code) {
                    showMessage('❌ Внеси го кодот', true);
                    return;
                }
                
                showMessage('🔐 Проверувам...', false);
                
                try {
                    const response = await fetch(`${API_URL}/verify-code`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, code: parseInt(code) })
                    });
                    const data = await response.json();
                    
                    if (data.success) {
                        const username = usernameInput.value.trim();
                        showMessage(`✅ Добредојде ${data.username}!`, false);
                        saveSession(email, data.username);
                        redirectToLobby();
                    } else {
                        showMessage(`❌ ${data.message}`, true);
                    }
                } catch (error) {
                    showMessage('❌ Грешка при проверка', true);
                }
            });
        }
    });
}
const API_URL = 'https://gamevault-api.onrender.com';