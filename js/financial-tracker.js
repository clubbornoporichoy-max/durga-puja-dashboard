/* ==================== FINANCIAL TRACKER MODULE ==================== */

let currentTransactionType = 'income';
let editingTransactionId = null;

// Initialize financial tracker
function initializeFinancialTracker() {
    console.log('Initializing financial tracker...');
    
    // Set up transaction modal event listeners
    setupTransactionModalEvents();
    
    // Set up filter event listeners
    setupFinancialFilterEvents();
    
    // Load initial financial data
    loadFinancialData();
}

// Load financial data
async function loadFinancialData() {
    console.log('Loading financial data for year:', selectedYear);
    
    try {
        await Promise.all([
            loadTransactions(),
            loadBudgetData(),
            updateFinancialSummary()
        ]);
        
        console.log('Financial data loaded successfully');
    } catch (error) {
        console.error('Error loading financial data:', error);
        showNotification('Error loading financial data: ' + error.message, 'error');
    }
}

// Load transactions
async function loadTransactions() {
    const tbody = document.querySelector('#transactions-table tbody');
    if (!tbody) {
        console.error('Transactions table body not found');
        return;
    }

    try {
        const targetYear = selectedYear === 'all' ? new Date().getFullYear() : selectedYear;
        const incomeSnap = await incomeCollectionFor(targetYear).orderBy('date', 'desc').get();
        const expenseSnap = await expenseCollectionFor(targetYear).orderBy('date', 'desc').get();
        
        tbody.innerHTML = '';
        let totalIncome = 0;
        let totalExpenses = 0;

        // Process income transactions
        incomeSnap.forEach(doc => {
            const data = doc.data();
            totalIncome += data.amount || 0;
            addTransactionToTable(doc.id, data, 'income', tbody);
        });

        // Process expense transactions
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
    
    // Add transaction class for styling
    tr.className = `transaction-${type}`;
    
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
        <td class="action-buttons"></td>
    `;

    // Add action buttons for admin
    const actionsTd = tr.querySelector('td:last-child');
    if (currentRole === 'admin') {
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = '✏️ Edit';
        editBtn.className = 'btn small secondary';
        editBtn.style.marginRight = '5px';
        editBtn.onclick = () => editTransaction(id, type, data);
        actionsTd.appendChild(editBtn);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️ Delete';
        deleteBtn.className = 'btn small ghost';
        deleteBtn.onclick = () => deleteTransaction(id, type);
        actionsTd.appendChild(deleteBtn);
    } else {
        actionsTd.innerHTML = '<span class="muted">View only</span>';
    }

    tbody.appendChild(tr);
}

// Edit transaction
function editTransaction(id, type, data) {
    editingTransactionId = id;
    currentTransactionType = type;
    
    showTransactionModal(type);
    
    // Populate form with existing data
    setTimeout(() => {
        document.getElementById('transaction-amount').value = data.amount || '';
        document.getElementById('transaction-date').value = data.date ? 
            new Date(data.date.seconds * 1000).toISOString().split('T')[0] : '';
        document.getElementById('transaction-category').value = data.category || '';
        document.getElementById('transaction-payment-mode').value = data.paymentMode || 'Cash';
        document.getElementById('transaction-description').value = data.description || '';
    }, 100);
}

// Delete transaction
async function deleteTransaction(id, type) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
        const targetYear = selectedYear === 'all' ? new Date().getFullYear() : selectedYear;
        const collection = type === 'income' ? incomeCollectionFor(targetYear) : expenseCollectionFor(targetYear);
        
        await collection.doc(id).delete();
        
        showNotification('Transaction deleted successfully', 'success');
        addActivity(`Deleted ${type} transaction`, 'info');
        loadFinancialData();
        
    } catch (error) {
        console.error('Error deleting transaction:', error);
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
                        <div class="progress-bar" style="margin-bottom: 8px;">
                            <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%;"></div>
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
        budgetContainer.innerHTML = '<p>Error loading budget data</p>';
    }
}

// Show transaction modal
function showTransactionModal(type = 'income') {
    currentTransactionType = type;
    editingTransactionId = null;
    
    const modal = document.getElementById('transactionModal');
    const title = document.getElementById('transactionModalTitle');
    const categorySelect = document.getElementById('transaction-category');
    const dateInput = document.getElementById('transaction-date');
    
    if (!modal || !title || !categorySelect || !dateInput) return;
    
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
    editingTransactionId = null;
}

// Save transaction
async function saveTransaction() {
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const date = document.getElementById('transaction-date').value;
    const category = document.getElementById('transaction-category').value;
    const paymentMode = document.getElementById('transaction-payment-mode').value;
    const description = document.getElementById('transaction-description').value;

    // Validation
    if (!amount || amount <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }

    if (!date) {
        showNotification('Please select a date', 'error');
        return;
    }

    if (!category) {
        showNotification('Please select a category', 'error');
        return;
    }

    try {
        const targetYear = selectedYear === 'all' ? new Date().getFullYear() : selectedYear;
        const collection = currentTransactionType === 'income' ? incomeCollectionFor(targetYear) : expenseCollectionFor(targetYear);
        
        const transactionData = {
            amount: amount,
            date: firebase.firestore.Timestamp.fromDate(new Date(date)),
            category: category,
            paymentMode: paymentMode,
            description: description,
            createdBy: auth.currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (editingTransactionId) {
            // Update existing transaction
            await collection.doc(editingTransactionId).update(transactionData);
            showNotification('Transaction updated successfully', 'success');
            addActivity(`Updated ${currentTransactionType} transaction`, 'success');
        } else {
            // Add new transaction
            await collection.add(transactionData);
            showNotification(`${currentTransactionType === 'income' ? 'Income' : 'Expense'} added successfully`, 'success');
            addActivity(`Added ${currentTransactionType} transaction`, 'success');
        }

        closeTransactionModal();
        loadFinancialData();
        
    } catch (error) {
        console.error('Error saving transaction:', error);
        showNotification('Error saving transaction: ' + error.message, 'error');
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

    const rows = document.querySelectorAll('#transactions-table tbody tr');
    
    rows.forEach(row => {
        let showRow = true;
        
        // Filter by type
        if (typeFilter !== 'all') {
            const isIncome = row.querySelector('.badge.ok') !== null;
            if ((typeFilter === 'income' && !isIncome) || (typeFilter === 'expense' && isIncome)) {
                showRow = false;
            }
        }
        
        // Filter by category
        if (showRow && categoryFilter !== 'all') {
            const category = row.cells[2].textContent;
            if (category !== categoryFilter) {
                showRow = false;
            }
        }
        
        // Filter by date range
        if (showRow && fromDate) {
            const rowDate = row.cells[0].textContent;
            // Implement date comparison logic here
        }
        
        row.style.display = showRow ? '' : 'none';
    });
}

// Set up transaction modal events
function setupTransactionModalEvents() {
    // This would set up any additional event listeners for the transaction modal
}

// Set up financial filter events
function setupFinancialFilterEvents() {
    // Populate category filter
    const categoryFilter = document.getElementById('filter-transaction-category');
    if (categoryFilter) {
        const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
        const uniqueCategories = [...new Set(allCategories)];
        
        uniqueCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }
}

// Export financial tracker functions
window.FinancialTracker = {
    initializeFinancialTracker,
    loadFinancialData,
    showTransactionModal,
    closeTransactionModal,
    saveTransaction,
    generateFinancialReport,
    filterTransactions
};
