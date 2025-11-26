/* ==================== AUTHENTICATION SYSTEM ==================== */

let currentRole = "viewer";
let currentUser = null;

// Initialize authentication system
function initializeAuthSystem() {
    console.log('Initializing authentication system...');
    
    // Set up auth state listener
    auth.onAuthStateChanged(handleAuthStateChange);
    
    // Set up login/logout event listeners
    setupAuthEventListeners();
}

// Handle authentication state changes
function handleAuthStateChange(user) {
    currentUser = user;
    
    if (user) {
        // User is signed in
        currentRole = ROLES[user.uid] || "viewer";
        handleUserSignedIn(user);
    } else {
        // User is signed out
        handleUserSignedOut();
    }
}

// Handle user sign in
function handleUserSignedIn(user) {
    console.log('User signed in:', user.email);
    
    // Update UI for signed-in state
    updateAuthUI(user);
    
    // Show main content
    showMainContent();
    
    // Apply role-based UI restrictions
    applyRoleToUI();
    
    // Initialize all modules
    initializeDashboardModules();
    
    // Add activity log
    addActivity('User logged in successfully', 'success');
}

// Handle user sign out
function handleUserSignedOut() {
    console.log('User signed out');
    
    // Update UI for signed-out state
    updateAuthUI(null);
    
    // Show auth card, hide main content
    showAuthCard();
    
    // Clear all data
    clearAllData();
    
    // Add activity log
    addActivity('User logged out', 'info');
}

// Update authentication UI
function updateAuthUI(user) {
    const userInfo = document.getElementById('user-info');
    const logoutBtn = document.getElementById('logout-btn');
    const globalYearSelector = document.getElementById('global-year-selector');
    
    if (user) {
        // User is signed in
        if (userInfo) userInfo.textContent = `${user.email} (${currentRole})`;
        if (logoutBtn) logoutBtn.classList.remove('hidden');
        if (globalYearSelector) globalYearSelector.classList.remove('hidden');
    } else {
        // User is signed out
        if (userInfo) userInfo.textContent = '';
        if (logoutBtn) logoutBtn.classList.add('hidden');
        if (globalYearSelector) globalYearSelector.classList.add('hidden');
    }
}

// Set up authentication event listeners
function setupAuthEventListeners() {
    // Login button
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Handle login
async function handleLogin() {
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;
    const loginYearSelect = document.getElementById('loginYearSelect');
    
    if (!email || !password) {
        showNotification('Please enter email and password', 'error');
        return;
    }
    
    const loginBtn = document.getElementById('login-btn');
    if (!loginBtn) return;
    
    try {
        // Use loading state
        await withLoading(loginBtn, async () => {
            await auth.signInWithEmailAndPassword(email, password);
            
            // Set selected year if available
            if (loginYearSelect && loginYearSelect.value) {
                const selectedYear = loginYearSelect.value === 'all' ? 'all' : parseInt(loginYearSelect.value);
                changeGlobalYear(selectedYear);
            }
            
            showNotification('Logged in successfully', 'success');
        })();
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed: ' + error.message, 'error');
        addActivity('Login failed: ' + error.message, 'error');
    }
}

// Handle logout
async function handleLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (!logoutBtn) return;
    
    try {
        await withLoading(logoutBtn, async () => {
            await auth.signOut();
            showNotification('Logged out successfully', 'success');
            cleanup();
        })();
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Logout failed: ' + error.message, 'error');
    }
}

// Apply role-based UI restrictions
function applyRoleToUI() {
    const adminOnlyElements = [
        "add-inv-btn", "add-mem-btn", "loadMemberFeeBtn", 
        "saveFeeConfigBtn", "clearFeeRecordBtn", "show-paid-btn", 
        "exportCsvBtn", "add-vc-btn"
    ];
    
    adminOnlyElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.disabled = (currentRole !== "admin");
            if (currentRole !== "admin") {
                el.title = "Admin access required";
            }
        }
    });
    
    // Update UI based on role
    updateUIBasedOnRole();
}

// Update UI based on user role
function updateUIBasedOnRole() {
    // Show/hide admin-only sections
    const adminSections = document.querySelectorAll('[data-admin-only]');
    adminSections.forEach(section => {
        if (currentRole !== "admin") {
            section.style.opacity = "0.6";
            section.title = "Admin access required";
        }
    });
}

// Show main content
function showMainContent() {
    const authCard = document.getElementById('auth-card');
    const mainContent = document.getElementById('main-content');
    
    if (authCard) authCard.classList.add('hidden');
    if (mainContent) mainContent.classList.remove('hidden');
}

// Show auth card
function showAuthCard() {
    const authCard = document.getElementById('auth-card');
    const mainContent = document.getElementById('main-content');
    
    if (authCard) authCard.classList.remove('hidden');
    if (mainContent) mainContent.classList.add('hidden');
}

// Clear all data on logout
function clearAllData() {
    clearAllTables();
    clearCache('');
    
    // Clear any chart instances
    if (window.collectionChart) {
        window.collectionChart.destroy();
        window.collectionChart = null;
    }
    
    if (window.budgetChart) {
        window.budgetChart.destroy();
        window.budgetChart = null;
    }
}

// Cleanup function
function cleanup() {
    // Clear intervals
    if (window.updateInterval) {
        clearInterval(window.updateInterval);
    }
    
    // Clear cache
    clearCache('');
    
    console.log('Cleanup completed');
}

// Check if user is admin
function isAdmin() {
    return currentRole === "admin";
}

// Get current user info
function getCurrentUser() {
    return {
        user: currentUser,
        role: currentRole,
        isAdmin: isAdmin()
    };
}

// Export auth functions
window.Auth = {
    initializeAuthSystem,
    handleLogin,
    handleLogout,
    isAdmin,
    getCurrentUser,
    cleanup
};
