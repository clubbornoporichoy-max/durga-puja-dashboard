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
    
    // Initialize event listeners
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
    loadFeeMembersDropdown();
    loadFeeYearlySummary();
    loadVillageCollections();
    loadFinancialData();
    recalcTotalCollected();
    
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
    initMembershipFeesEvents();
    
    // Initialize invitations events
    initInvitationsEvents();
    
    // Initialize members events
    initMembersEvents();
    
    // Initialize village collections events
    initVillageCollectionsEvents();
    
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
        await Promise.all([
            loadInvitations(),
            loadMembers(),
            loadVillageCollections(),
            updateSummaryCards(),
            loadVillageBreakdown(),
            loadFeeMembersDropdown(),
            loadFeeYearlySummary()
        ]);
        
        console.log('All data loaded successfully');
        addActivity('All data loaded successfully', 'success');
        
    } catch (error) {
        console.error('Error loading all data:', error);
        showNotification('Error loading data: ' + error.message, 'error');
        addActivity('Error loading data: ' + error.message, 'error');
    }
}

// Update summary cards
async function updateSummaryCards() {
    try {
        // Total invitations
        const invitationsSnap = await withCache('invitations', () => invitationCol.orderBy("dateAdded", "desc").get());
        const totalInvitations = invitationsSnap.size;
        safeSetTextContent('total-invitations', totalInvitations);

        // Total members
        const membersSnap = await withCache('members', () => membersCol.orderBy("name").get());
        const totalMembers = membersSnap.size;
        safeSetTextContent('total-members', totalMembers);

        // Pending invitations
        let pendingInvitations = 0;
        invitationsSnap.forEach(doc => {
            const data = doc.data();
            if (!data.sent) pendingInvitations++;
        });
        safeSetTextContent('pending-invitations', pendingInvitations);

        // Active collectors (using members)
        safeSetTextContent('active-collectors', totalMembers);

    } catch (error) {
        console.error("Error updating summary cards:", error);
    }
}

// Load village breakdown
async function loadVillageBreakdown() {
    const breakdownContainer = document.getElementById('village-breakdown');
    if (!breakdownContainer) return;
    
    try {
        let villageTotals = {};
        
        if (selectedYear === 'all') {
            // Aggregate data from all years
            if (Object.keys(allYearsVillageData).length === 0) {
                await loadAllYearsVillageCollections();
            }
            
            Object.values(allYearsVillageData).forEach(yearData => {
                Object.values(yearData).forEach(collection => {
                    const village = collection.village || 'Others';
                    villageTotals[village] = (villageTotals[village] || 0) + (collection.amount || 0);
                });
            });
        } else {
            // Single year data
            const villageCol = villageCollectionsCollectionFor(selectedYear);
            const snap = await villageCol.get();
            
            snap.forEach(doc => {
                const d = doc.data();
                const village = d.village || 'Others';
                villageTotals[village] = (villageTotals[village] || 0) + (d.amount || 0);
            });
        }
        
        breakdownContainer.innerHTML = Object.entries(villageTotals)
            .map(([village, total]) => `
                <div class="breakdown-item">
                    <div class="breakdown-label">${village}</div>
                    <div class="breakdown-value">₹${total.toLocaleString()}</div>
                </div>
            `).join('');
    } catch (error) {
        console.error("Error loading village breakdown:", error);
        breakdownContainer.innerHTML = '<div class="breakdown-item">Error loading data</div>';
    }
}

// Quick action functions
async function exportAllData() {
    try {
        addActivity('Starting data export...', 'info');
        
        const [invitations, members] = await Promise.all([
            withCache('invitations', () => invitationCol.orderBy("dateAdded", "desc").get()),
            withCache('members', () => membersCol.orderBy("name").get())
        ]);
        
        // Get year-specific data
        let fees, collections, income, expenses;
        if (selectedYear === 'all') {
            fees = { docs: [] };
            collections = { docs: [] };
            income = { docs: [] };
            expenses = { docs: [] };
            
            // Aggregate all years data
            if (Object.keys(allYearsFeesData).length === 0) {
                await loadAllYearsFees();
            }
            if (Object.keys(allYearsVillageData).length === 0) {
                await loadAllYearsVillageCollections();
            }
            
            Object.values(allYearsFeesData).forEach(yearData => {
                Object.entries(yearData).forEach(([id, data]) => {
                    fees.docs.push({ id, data: () => data });
                });
            });
            
            Object.values(allYearsVillageData).forEach(yearData => {
                Object.entries(yearData).forEach(([id, data]) => {
                    collections.docs.push({ id, data: () => data });
                });
            });
        } else {
            [fees, collections, income, expenses] = await Promise.all([
                membershipFeesCollectionFor(selectedYear).get(),
                villageCollectionsCollectionFor(selectedYear).get(),
                incomeCollectionFor(selectedYear).get(),
                expenseCollectionFor(selectedYear).get()
            ]);
        }
        
        const data = {
            invitations: invitations.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            members: members.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            collections: collections.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            fees: fees.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            income: income.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            expenses: expenses.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        downloadBlob(blob, `club-bornoporichoy-backup-${new Date().toISOString().split('T')[0]}.json`);
        
        showNotification('All data exported successfully!', 'success');
        addActivity('Data exported successfully', 'success');
    } catch (error) {
        showNotification('Export failed: ' + error.message, 'error');
        addActivity('Data export failed: ' + error.message, 'error');
    }
}

function backupData() {
    showNotification('Auto backup feature coming soon!', 'info');
    addActivity('Backup triggered', 'info');
}

function showAllYearsData() {
    changeGlobalYear('all');
}

function showYearComparison() {
    showNotification('Year comparison feature coming soon!', 'info');
}

// Recalculate total collected
async function recalcTotalCollected() {
    try {
        let totalVillage = 0;
        let totalMembership = 0;
        
        // Calculate village collections
        if (selectedYear === 'all') {
            // Aggregate from all years
            if (Object.keys(allYearsVillageData).length === 0) {
                await loadAllYearsVillageCollections();
            }
            
            Object.values(allYearsVillageData).forEach(yearData => {
                Object.values(yearData).forEach(collection => {
                    totalVillage += collection.amount || 0;
                });
            });
        } else {
            // Single year
            const targetYear = selectedYear === 'all' ? new Date().getFullYear() : selectedYear;
            const villageCol = villageCollectionsCollectionFor(targetYear);
            const villageSnap = await villageCol.get();
            villageSnap.forEach(doc => {
                totalVillage += doc.data().amount || 0;
            });
        }
        
        // Calculate membership fees
        if (selectedYear === 'all') {
            // Aggregate from all years
            Object.values(allYearsFeesData).forEach(yearData => {
                Object.values(yearData).forEach(memberFees => {
                    MONTHS.forEach(month => {
                        if (memberFees[month] && memberFees[month].paid) {
                            totalMembership += memberFees.monthlyFee || 100;
                        }
                    });
                });
            });
        } else {
            // Single year - calculate from monthly summary
            const targetYear = selectedYear === 'all' ? new Date().getFullYear() : selectedYear;
            const feesCol = membershipFeesCollectionFor(targetYear);
            const feesSnap = await feesCol.get();
            feesSnap.forEach(doc => {
                const data = doc.data();
                MONTHS.forEach(month => {
                    if (data[month] && data[month].paid) {
                        totalMembership += data.monthlyFee || 100;
                    }
                });
            });
        }
        
        const totalCollection = totalVillage + totalMembership;
        
    } catch (error) {
        console.error("Recalc total collected error:", error);
    }
}

// Update monthly summary
async function updateMonthlySummary() {
    await recalcTotalCollected();
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
