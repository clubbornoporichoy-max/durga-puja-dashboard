// =============================================
// FINANCIAL FUNCTIONS
// =============================================

// Financial Constants
const INCOME_CATEGORIES = [
    'Donations', 'Membership Fees', 'Sponsorships', 'Advertisement', 
    'Ticket Sales', 'Food Stalls', 'Cultural Events', 'Others'
];

const EXPENSE_CATEGORIES = [
    'Pandal & Decorations', 'Idol & Materials', 'Priest & Rituals',
    'Electricity & Sound', 'Cooking and Materials', 'Food & Prasad', 'Cultural Program',
    'Printing & Publicity', 'Transportation', 'Miscellaneous', 'Puja Hat & Materials', 'Awards & others', 'Club Construction', 'Dhaki & Napit'
];

const BUDGET_ITEMS = {
    'Pandal & Decorations': 70000,
    'Idol & Materials': 40000,
    'Priest & Rituals': 15000,
    'Electricity & Sound': 30000,
    'Cooking and Materials': 8000,
    'Food & Prasad': 40000,
    'Cultural Program': 15000,
    'Printing & Publicity': 20000,
    'Transportation': 7000,
    'Miscellaneous': 12000,
    'Puja Hat & Materials': 35000,
    'Awards & others': 10000,
    'Club Construction': 80000,
    'Dhaki & Napit': 12000
};

let currentTransactionType = 'income';

// Transaction Modal Function
function showTransactionModal(type = 'income') {
    console.log("💰 Opening transaction modal...");
    currentTransactionType = type;
    const modal = document.getElementById('transactionModal');
    const title = document.getElementById('transactionModalTitle');
    const categorySelect = document.getElementById('transaction-category');
    const dateInput = document.getElementById('transaction-date');
    
    if (!modal || !title || !categorySelect || !dateInput) {
        console.error("Transaction modal elements not found");
        return;
    }
    
    // Set modal title
    title.textContent = type === 'income' ? '💰 Add Income' : '💸 Add Expense';
    
    // Populate categories
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    categorySelect.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    
    // Set default date to today
    dateInput.value = new Date().toISOString().split('T')[0];
    
    // Clear other fields
    document.getElementById('transaction-amount').value = '';
    document.getElementById('transaction-payment-mode').value = 'Cash';
    document.getElementById('transaction-description').value = '';
    
    modal.classList.remove('hidden');
}

// Close transaction modal
function closeTransactionModal() {
    const modal = document.getElementById('transactionModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Save transaction
async function saveTransaction() {
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const date = document.getElementById('transaction-date').value;
    const category = document.getElementById('transaction-category').value;
    const paymentMode = document.getElementById('transaction-payment-mode').value;
    const description = document.getElementById('transaction-description').value;

    if (!amount || amount <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }

    if (!date) {
        showNotification('Please select a date', 'error');
        return;
    }

    try {
        const targetYear = selectedYear === 'all' ? new Date().getFullYear() : selectedYear;
        const collection = currentTransactionType === 'income' ? incomeCollectionFor(targetYear) : expenseCollectionFor(targetYear);
        
        await collection.add({
            amount: amount,
            date: firebase.firestore.Timestamp.fromDate(new Date(date)),
            category: category,
            paymentMode: paymentMode,
            description: description,
            createdBy: auth.currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showNotification(`${currentTransactionType === 'income' ? 'Income' : 'Expense'} added successfully`, 'success');
        closeTransactionModal();
        loadFinancialData();
        
    } catch (error) {
        showNotification('Error saving transaction: ' + error.message, 'error');
    }
}

// Bulk Upload Modal Function
function showBulkUploadModal() {
    console.log("📤 Opening bulk upload modal...");
    showNotification('Bulk upload feature coming soon!', 'info');
}

function closeBulkUploadModal() {
    // Implementation for bulk upload modal close
}

// Load Fee Members Dropdown Function
function loadFeeMembersDropdown() {
    console.log("🔽 Loading fee members dropdown...");
    
    const yearSelect = document.getElementById('feeYearSelect');
    const memberSelect = document.getElementById('feeMemberSelect');
    
    if (!memberSelect) {
        console.log("❌ Fee member select not found");
        return;
    }
    
    // For now, just add a placeholder option
    // TODO: Replace with actual data loading
    memberSelect.innerHTML = '<option value="">Select Member</option>';
    
    if (yearSelect) {
        const selectedYear = yearSelect.value;
        console.log(`Loading members for year: ${selectedYear}`);
    }
}

// Load financial data
async function loadFinancialData() {
    console.log('Loading financial data for year:', selectedYear);
    await loadTransactions();
    await loadBudgetData();
    updateFinancialSummary();
}

// Load transactions
async function loadTransactions() {
    const tbody = document.querySelector('#transactions-table tbody');
    if (!tbody) {
        console.error('Transactions table not found');
        return;
    }

    try {
        const targetYear = selectedYear === 'all' ? new Date().getFullYear() : selectedYear;
        const incomeSnap = await incomeCollectionFor(targetYear).orderBy('date', 'desc').get();
        const expenseSnap = await expenseCollectionFor(targetYear).orderBy('date', 'desc').get();
        
        tbody.innerHTML = '';
        let totalIncome = 0;
        let totalExpenses = 0;

        // Process income
        incomeSnap.forEach(doc => {
            const data = doc.data();
            totalIncome += data.amount || 0;
            addTransactionToTable(doc.id, data, 'income', tbody);
        });

        // Process expenses
        expenseSnap.forEach(doc => {
            const data = doc.data();
            totalExpenses += data.amount || 0;
            addTransactionToTable(doc.id, data, 'expense', tbody);
        });

        // Update table totals
        safeSetTextContent('table-total-income', `₹${totalIncome.toLocaleString()}`);
        safeSetTextContent('table-total-expenses', `₹${totalExpenses.toLocaleString()}`);
        safeSetTextContent('table-net-balance', `₹${(totalIncome - totalExpenses).toLocaleString()}`);

    } catch (error) {
        console.error('Error loading transactions:', error);
        showNotification('Error loading transactions: ' + error.message, 'error');
    }
}

// Add transaction to table
function addTransactionToTable(id, data, type, tbody) {
    const tr = document.createElement('tr');
    const isIncome = type === 'income';
    
    tr.innerHTML = `
        <td>${data.date ? new Date(data.date.seconds * 1000).toLocaleDateString() : ''}</td>
        <td>
            <span class="badge ${isIncome ? 'ok' : 'warn'}">
                ${isIncome ? '💰 Income' : '💸 Expense'}
            </span>
        </td>
        <td>${data.category || 'Uncategorized'}</td>
        <td>${escapeHtml(data.description || '')}</td>
        <td style="color: ${isIncome ? '#28a745' : '#dc3545'}; font-weight: bold;">
            ${isIncome ? '+' : '-'}₹${(data.amount || 0).toLocaleString()}
        </td>
        <td>${data.paymentMode || 'Cash'}</td>
        <td></td>
    `;

    // Add action buttons for admin
    if (currentRole === 'admin') {
        const actionsTd = tr.querySelector('td:last-child');
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'btn small ghost';
        deleteBtn.onclick = () => deleteTransaction(id, type);
        actionsTd.appendChild(deleteBtn);
    }

    tbody.appendChild(tr);
}

// Delete transaction
async function deleteTransaction(id, type) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
        const targetYear = selectedYear === 'all' ? new Date().getFullYear() : selectedYear;
        const collection = type === 'income' ? incomeCollectionFor(targetYear) : expenseCollectionFor(targetYear);
        await collection.doc(id).delete();
        showNotification('Transaction deleted successfully', 'success');
        loadFinancialData();
    } catch (error) {
        showNotification('Error deleting transaction: ' + error.message, 'error');
    }
}

// Update financial summary
async function updateFinancialSummary() {
    try {
        const targetYear = selectedYear === 'all' ? new Date().getFullYear() : selectedYear;
        const incomeSnap = await incomeCollectionFor(targetYear).get();
        const expenseSnap = await expenseCollectionFor(targetYear).get();
        
        let totalIncome = 0;
        let totalExpenses = 0;

        incomeSnap.forEach(doc => {
            totalIncome += doc.data().amount || 0;
        });

        expenseSnap.forEach(doc => {
            totalExpenses += doc.data().amount || 0;
        });

        const netBalance = totalIncome - totalExpenses;
        const totalBudget = Object.values(BUDGET_ITEMS).reduce((a, b) => a + b, 0);
        const budgetUtilization = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

        safeSetTextContent('total-income', `₹${totalIncome.toLocaleString()}`);
        safeSetTextContent('total-expenses', `₹${totalExpenses.toLocaleString()}`);
        safeSetTextContent('net-balance', `₹${netBalance.toLocaleString()}`);
        safeSetTextContent('budget-utilization', `${budgetUtilization.toFixed(1)}%`);

    } catch (error) {
        console.error('Error updating financial summary:', error);
    }
}

// Load budget data
async function loadBudgetData() {
    const budgetContainer = document.getElementById('budget-cards-container');
    if (!budgetContainer) return;

    try {
        const targetYear = selectedYear === 'all' ? new Date().getFullYear() : selectedYear;
        const expenseSnap = await expenseCollectionFor(targetYear).get();
        const categoryExpenses = {};
        const actualExpenses = [];

        // Calculate actual expenses by category
        expenseSnap.forEach(doc => {
            const data = doc.data();
            const category = data.category || 'Miscellaneous';
            categoryExpenses[category] = (categoryExpenses[category] || 0) + (data.amount || 0);
        });

        // Create budget cards
        budgetContainer.innerHTML = Object.entries(BUDGET_ITEMS)
            .map(([category, budget]) => {
                const actual = categoryExpenses[category] || 0;
                const percentage = budget > 0 ? (actual / budget) * 100 : 0;
                let statusClass = 'good';
                if (percentage > 100) statusClass = 'over-budget';
                else if (percentage > 80) statusClass = 'warning';

                actualExpenses.push(actual);

                return `
                    <div class="budget-card ${statusClass}">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <strong>${category}</strong>
                            <span style="color: ${percentage > 100 ? '#dc3545' : percentage > 80 ? '#ffc107' : '#28a745'}; font-weight: bold;">
                                ${percentage.toFixed(1)}%
                            </span>
                        </div>
                        <div class="progress-bar" style="height: 8px; background: #f0f0f0; border-radius: 4px; margin-bottom: 8px;">
                            <div class="progress-fill" style="height: 100%; background: ${percentage > 100 ? '#dc3545' : percentage > 80 ? '#ffc107' : '#28a745'}; width: ${Math.min(percentage, 100)}%; border-radius: 4px;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--muted);">
                            <span>Actual: ₹${actual.toLocaleString()}</span>
                            <span>Budget: ₹${budget.toLocaleString()}</span>
                        </div>
                        <div style="font-size: 11px; color: ${percentage > 100 ? '#dc3545' : percentage > 80 ? '#ffc107' : '#28a745'}; margin-top: 5px;">
                            ${percentage > 100 ? '⚠️ Over budget' : percentage > 80 ? '⚠️ Approaching limit' : '✅ Within budget'}
                        </div>
                    </div>
                `;
            }).join('');

        // Update budget chart
        if (budgetChart) {
            budgetChart.data.datasets[1].data = actualExpenses;
            budgetChart.update();
        }

    } catch (error) {
        console.error('Error loading budget data:', error);
    }
}

// Generate financial report
async function generateFinancialReport() {
    try {
        const targetYear = selectedYear === 'all' ? new Date().getFullYear() : selectedYear;
        const incomeSnap = await incomeCollectionFor(targetYear).get();
        const expenseSnap = await expenseCollectionFor(targetYear).get();

        let report = `CLUB BORNOPORICHOY - FINANCIAL REPORT ${targetYear}\n`;
        report += `Generated on: ${new Date().toLocaleDateString()}\n`;
        report += `Total Budget: ₹${Object.values(BUDGET_ITEMS).reduce((a, b) => a + b, 0).toLocaleString()}\n\n`;

        // Income Summary
        report += `INCOME SUMMARY\n`;
        report += `${'='.repeat(50)}\n`;
        
        const incomeByCategory = {};
        let totalIncome = 0;

        incomeSnap.forEach(doc => {
            const data = doc.data();
            const category = data.category || 'Uncategorized';
            incomeByCategory[category] = (incomeByCategory[category] || 0) + (data.amount || 0);
            totalIncome += data.amount || 0;
        });

        Object.entries(incomeByCategory).forEach(([category, amount]) => {
            report += `${category.padEnd(25)}: ₹${amount.toLocaleString()}\n`;
        });
        report += `\nTotal Income: ₹${totalIncome.toLocaleString()}\n\n`;

        // Expense Summary
        report += `EXPENSE SUMMARY\n`;
        report += `${'='.repeat(50)}\n`;
        
        const expenseByCategory = {};
        let totalExpenses = 0;

        expenseSnap.forEach(doc => {
            const data = doc.data();
            const category = data.category || 'Uncategorized';
            expenseByCategory[category] = (expenseByCategory[category] || 0) + (data.amount || 0);
            totalExpenses += data.amount || 0;
        });

        Object.entries(expenseByCategory).forEach(([category, amount]) => {
            const budget = BUDGET_ITEMS[category] || 0;
            const percentage = budget > 0 ? (amount / budget) * 100 : 0;
            report += `${category.padEnd(25)}: ₹${amount.toLocaleString()} / ₹${budget.toLocaleString()} (${percentage.toFixed(1)}%)\n`;
        });
        report += `\nTotal Expenses: ₹${totalExpenses.toLocaleString()}\n\n`;

        // Net Summary
        report += `NET SUMMARY\n`;
        report += `${'='.repeat(50)}\n`;
        const netBalance = totalIncome - totalExpenses;
        report += `Net Balance: ₹${netBalance.toLocaleString()}\n`;
        report += `Budget Utilization: ${((totalExpenses / Object.values(BUDGET_ITEMS).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%\n`;

        // Budget Status
        report += `\nBUDGET STATUS\n`;
        report += `${'='.repeat(50)}\n`;
        Object.entries(BUDGET_ITEMS).forEach(([category, budget]) => {
            const actual = expenseByCategory[category] || 0;
            const percentage = budget > 0 ? (actual / budget) * 100 : 0;
            const status = percentage > 100 ? 'OVER BUDGET' : percentage > 80 ? 'WARNING' : 'OK';
            report += `${category.padEnd(25)}: ${status.padEnd(12)} (${percentage.toFixed(1)}%)\n`;
        });

        // Download report
        const blob = new Blob([report], { type: 'text/plain' });
        downloadBlob(blob, `financial-report-${targetYear}.txt`);

        showNotification('Financial report generated successfully', 'success');
        addActivity('Generated financial report', 'success');

    } catch (error) {
        showNotification('Error generating financial report: ' + error.message, 'error');
        addActivity('Failed to generate financial report: ' + error.message, 'error');
    }
}

// Filter transactions
function filterTransactions() {
    const typeFilter = document.getElementById('filter-transaction-type').value;
    const categoryFilter = document.getElementById('filter-transaction-category').value;
    const fromDate = document.getElementById('filter-transaction-from').value;
    const toDate = document.getElementById('filter-transaction-to').value;

    console.log('Filtering transactions:', { typeFilter, categoryFilter, fromDate, toDate });
    showNotification('Filter functionality coming soon!', 'info');
}

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

// Initialize membership fees events
function initMembershipFeesEvents() {
    console.log("📋 Initializing membership fees events...");
    
    try {
        // Get all the buttons and elements
        const addFeeBtn = document.getElementById('addFeeBtn');
        const bulkUploadBtn = document.getElementById('bulkUploadBtn');
        const feeYearSelect = document.getElementById('feeYearSelect');
        
        console.log("🔍 Found elements:", {
            addFeeBtn: !!addFeeBtn,
            bulkUploadBtn: !!bulkUploadBtn,
            feeYearSelect: !!feeYearSelect
        });
        
        // Set up event listeners for Add Fee button
        if (addFeeBtn) {
            console.log("✅ Setting up add fee button listener");
            // Remove any existing inline handlers and use our function
            addFeeBtn.onclick = null;
            addFeeBtn.addEventListener('click', showTransactionModal);
        } else {
            console.log("❌ Add fee button not found");
        }
        
        // Set up event listeners for Bulk Upload button
        if (bulkUploadBtn) {
            console.log("✅ Setting up bulk upload button listener");
            // Remove any existing inline handlers and use our function
            bulkUploadBtn.onclick = null;
            bulkUploadBtn.addEventListener('click', showBulkUploadModal);
        } else {
            console.log("❌ Bulk upload button not found");
        }
        
        // Set up event listener for year selection
        if (feeYearSelect) {
            console.log("✅ Setting up fee year select listener");
            feeYearSelect.addEventListener('change', loadFeeMembersDropdown);
        } else {
            console.log("❌ Fee year select not found");
        }
        
    } catch (error) {
        console.error("❌ Error in initMembershipFeesEvents:", error);
    }
}

// Initialize charts
function initializeCharts() {
    console.log('Initializing charts placeholder');
}

// Placeholder functions
function loadFeeMembersDropdown() {
    console.log('Loading fee members dropdown placeholder');
}

function loadFeeYearlySummary() {
    console.log('Loading fee yearly summary placeholder');
}

function loadVillageCollections() {
    console.log('Loading village collections placeholder');
}

function recalcTotalCollected() {
    console.log('Recalculating total collected placeholder');
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

function exportInvitationsBulk() {
    showNotification('Export invitations feature coming soon!', 'info');
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
