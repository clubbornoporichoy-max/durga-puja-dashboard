/* ==================== MAIN APPLICATION MODULES ==================== */

// Global variables
let selectedYear = new Date().getFullYear();
let allYearsFeesData = {};
let allYearsVillageData = {};
let collectionChart = null;
let budgetChart = null;

// Initialize all dashboard modules
function initializeDashboardModules() {
    console.log('Initializing dashboard modules...');
    
    // Initialize year system
    initializeYearSystem();
    
    // Initialize navigation
    initializeNavigation();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load all data
    loadAllData();
    
    // Initialize charts
    initializeCharts();
    
    // Load financial data
    loadFinancialData();
    
    console.log('All dashboard modules initialized');
}

// Initialize year system
function initializeYearSystem() {
    console.log('Initializing year system...');
    
    // Populate year dropdowns
    populateYearDropdowns();
    
    // Update year displays
    updateYearDisplays();
    
    // Set up year change listeners
    setupYearChangeListeners();
}

// Populate year dropdowns
function populateYearDropdowns() {
    const loginYearSelect = document.getElementById('loginYearSelect');
    const globalYearSelect = document.getElementById('globalYearSelect');
    
    if (!loginYearSelect || !globalYearSelect) return;
    
    // Clear existing options
    loginYearSelect.innerHTML = '';
    globalYearSelect.innerHTML = '';
    
    // Add "All Years" option
    const allYearsOption = document.createElement('option');
    allYearsOption.value = 'all';
    allYearsOption.textContent = 'All Years';
    
    loginYearSelect.appendChild(allYearsOption.cloneNode(true));
    globalYearSelect.appendChild(allYearsOption.cloneNode(true));
    
    // Add years from 2024 to 2050
    for (let year = 2024; year <= 2050; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        
        if (year === selectedYear) {
            option.selected = true;
        }
        
        loginYearSelect.appendChild(option.cloneNode(true));
        globalYearSelect.appendChild(option);
    }
}

// Update year displays
function updateYearDisplays() {
    const elements = [
        'current-year-display',
        'fees-year-display', 
        'paid-tracker-year-display',
        'village-collection-year-display',
        'financial-year-display',
        'financial-tracker-year-display',
        'budget-year-display'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = selectedYear === 'all' ? 'All Years' : selectedYear;
        }
    });
    
    // Update year data status
    const yearDataStatus = document.getElementById('year-data-status');
    const yearDataDescription = document.getElementById('year-data-description');
    
    if (selectedYear === 'all') {
        if (yearDataStatus) yearDataStatus.textContent = 'All Years Data';
        if (yearDataDescription) yearDataDescription.textContent = 'Viewing aggregated data from all years. Membership fees and financial data are combined across all available years.';
    } else {
        if (yearDataStatus) yearDataStatus.textContent = `Year ${selectedYear}`;
        if (yearDataDescription) yearDataDescription.textContent = `Viewing membership fees and financial data for ${selectedYear}. Other data (invitations, members) shows all years.`;
    }
}

// Set up year change listeners
function setupYearChangeListeners() {
    const loginYearSelect = document.getElementById('loginYearSelect');
    const globalYearSelect = document.getElementById('globalYearSelect');
    
    if (loginYearSelect) {
        loginYearSelect.addEventListener('change', function(e) {
            selectedYear = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
            updateYearDisplays();
        });
    }
    
    if (globalYearSelect) {
        globalYearSelect.addEventListener('change', function(e) {
            changeGlobalYear(e.target.value);
        });
    }
}

// Change global year
function changeGlobalYear(newYear) {
    selectedYear = newYear === 'all' ? 'all' : parseInt(newYear);
    updateYearDisplays();
    
    // Clear cache when year changes
    clearCache('fees');
    clearCache('village');
    clearCache('financial');
    
    // Reload all year-dependent data
    if (typeof loadFeeMembersDropdown === 'function') loadFeeMembersDropdown();
    if (typeof loadFeeYearlySummary === 'function') loadFeeYearlySummary();
    if (typeof loadVillageCollections === 'function') loadVillageCollections();
    if (typeof loadFinancialData === 'function') loadFinancialData();
    if (typeof recalcTotalCollected === 'function') recalcTotalCollected();
    
    // Show notification
    if (selectedYear === 'all') {
        showNotification('Now viewing data from all years', 'info');
        addActivity('Changed to view all years data', 'info');
    } else {
        showNotification(`Year changed to ${selectedYear}. All data updated.`, 'info');
        addActivity(`Changed global year to ${selectedYear}`, 'info');
    }
}

// Initialize navigation
function initializeNavigation() {
    console.log('Initializing navigation...');
    
    // Set up navigation event listeners
    const navLinks = ['nav-invitations', 'nav-members', 'nav-fees', 'nav-financial', 'nav-village-collection'];
    
    navLinks.forEach(navId => {
        const navElement = document.getElementById(navId);
        if (navElement) {
            navElement.addEventListener("click", (e) => {
                e.preventDefault();
                const targetId = navId.replace('nav-', '');
                navigateToSection(targetId);
            });
        }
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            navigateToSection(hash);
        }
    });
    
    // Initialize with current hash
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        navigateToSection(hash);
    }
}

// Navigate to section
function navigateToSection(sectionId) {
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
        // Update URL without page reload
        history.pushState(null, '', `#${sectionId}`);
        
        targetElement.scrollIntoView({ 
            behavior: "smooth",
            block: "start"
        });
        
        // Update active nav
        clearActiveNav();
        const navElement = document.getElementById(`nav-${sectionId}`);
        if (navElement) navElement.classList.add('active');
        
        // Update screen reader
        const liveRegion = document.getElementById('sr-live-region');
        if (liveRegion) {
            liveRegion.textContent = `Navigated to ${sectionId} section`;
        }
    }
}

// Clear active navigation
function clearActiveNav() { 
    document.querySelectorAll('nav.topbar a').forEach(a => {
        if (a) a.classList.remove('active');
    }); 
}

// Set up event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Initialize membership fees events
    if (typeof initMembershipFeesEvents === 'function') {
        initMembershipFeesEvents();
    }
    
    // Set up search functionality
    setupSearchFunctionality();
    
    // Set up global error handlers
    setupGlobalErrorHandlers();
    
    // Set up accessibility features
    setupAccessibility();
}

// Set up search functionality
function setupSearchFunctionality() {
    // Invitations search
    const searchInvite = document.getElementById("search-invite");
    if (searchInvite) {
        searchInvite.addEventListener("input", (e) => debouncedFilterTable("invitation-table", e.target.value));
    }
    
    // Members search
    const searchMembers = document.getElementById("search-members");
    if (searchMembers) {
        searchMembers.addEventListener("input", (e) => debouncedFilterTable("members-table", e.target.value));
    }
    
    // Village collections search
    const searchVc = document.getElementById("search-vc");
    if (searchVc) {
        searchVc.addEventListener("input", (e) => debouncedFilterTable("vc-table", e.target.value));
    }
}

// Set up global error handlers
function setupGlobalErrorHandlers() {
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
        showNotification('An unexpected error occurred', 'error');
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
        showNotification('Operation failed: ' + (e.reason?.message || 'Unknown error'), 'error');
        e.preventDefault();
    });
}

// Set up accessibility features
function setupAccessibility() {
    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
    
    // Enhanced notifications for screen readers
    const liveRegion = document.getElementById('sr-live-region');
    if (liveRegion) {
        // Notifications will automatically update this region
    }
}

// Load all data
async function loadAllData() {
    console.log('Loading all data...');
    
    try {
        // Load core data
        if (typeof loadInvitations === 'function') await loadInvitations();
        if (typeof loadMembers === 'function') await loadMembers();
        if (typeof loadVillageCollections === 'function') await loadVillageCollections();
        
        // Load summaries
        if (typeof updateSummaryCards === 'function') await updateSummaryCards();
        if (typeof loadVillageBreakdown === 'function') await loadVillageBreakdown();
        if (typeof loadFeeMembersDropdown === 'function') await loadFeeMembersDropdown();
        if (typeof loadFeeYearlySummary === 'function') await loadFeeYearlySummary();
        
        console.log('All data loaded successfully');
        addActivity('All data loaded successfully', 'success');
        
    } catch (error) {
        console.error('Error loading all data:', error);
        showNotification('Error loading data: ' + error.message, 'error');
        addActivity('Error loading data: ' + error.message, 'error');
    }
}

// Placeholder functions that will be overridden by module files
function initMembershipFeesEvents() {
    console.log('Membership fees events placeholder');
}

function loadFeeMembersDropdown() {
    console.log('Loading fee members dropdown placeholder');
}

function loadFeeYearlySummary() {
    console.log('Loading fee yearly summary placeholder');
}

function loadVillageCollections() {
    console.log('Loading village collections placeholder');
}

function loadFinancialData() {
    console.log('Loading financial data placeholder');
}

function recalcTotalCollected() {
    console.log('Recalculating total collected placeholder');
}

function initializeCharts() {
    console.log('Initializing charts placeholder');
}

function loadInvitations() {
    console.log('Loading invitations placeholder');
}

function loadMembers() {
    console.log('Loading members placeholder');
}

function updateSummaryCards() {
    console.log('Updating summary cards placeholder');
}

function loadVillageBreakdown() {
    console.log('Loading village breakdown placeholder');
}

// Quick action functions
async function exportAllData() {
    showNotification('Export feature coming soon!', 'info');
}

function backupData() {
    showNotification('Backup feature coming soon!', 'info');
}

function showAllYearsData() {
    changeGlobalYear('all');
}

function showYearComparison() {
    showNotification('Year comparison feature coming soon!', 'info');
}

// Export module functions
window.Modules = {
    initializeDashboardModules,
    changeGlobalYear,
    showAllYearsData,
    exportAllData,
    backupData,
    navigateToSection
};
