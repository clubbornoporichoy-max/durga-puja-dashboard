/* ==================== UI COMPONENTS ==================== */

// Render the main application structure
function renderAppStructure() {
    const app = document.getElementById('app');
    if (!app) return;
    
    app.innerHTML = `
        <!-- Header -->
        <header>
            <div class="header-inner">
                <div class="brand">
                    <div class="logo">CB</div>
                    <div>
                        <h1>Club Bornoporichoy</h1>
                        <div class="sub">Durga Puja Dashboard</div>
                    </div>
                </div>

                <nav class="topbar" role="navigation" aria-label="Main navigation">
                    <a href="#invitations" id="nav-invitations" class="active">Manage Invitations</a>
                    <a href="#members" id="nav-members">Members</a>
                    <a href="#fees" id="nav-fees">Membership Fees</a>
                    <a href="#financial-tracker" id="nav-financial">Financial Tracker</a>
                    <a href="#village-collection" id="nav-village-collection">Village Collection</a>
                </nav>

                <div class="global-year-selector hidden" id="global-year-selector">
                    <label>📅 Year:</label>
                    <select id="globalYearSelect"></select>
                </div>

                <div class="auth-area">
                    <div id="user-info" class="muted" style="font-size:13px"></div>
                    <button id="logout-btn" class="btn small hidden">Logout</button>
                </div>
            </div>
        </header>

        <div class="spacer"></div>

        <div class="container">
            <!-- Auth Card -->
            <div class="card" id="auth-card">
                ${renderAuthCard()}
            </div>

            <!-- Main Content -->
            <div id="main-content" class="hidden">
                ${renderDashboardOverview()}
                ${renderFinancialOverview()}
                ${renderQuickActions()}
                ${renderRecentActivity()}
                ${renderYearInfo()}
                ${renderBudgetTracker()}
                ${renderFinancialTracker()}
                ${renderInvitationsSection()}
                ${renderMembersSection()}
                ${renderMembershipFeesSection()}
                ${renderPaidTrackerSection()}
                ${renderVillageCollectionSection()}
            </div>
        </div>

        <!-- Toast Container -->
        <div class="toast-container" id="toast-container"></div>

        <!-- Modals Container -->
        <div id="modals-container">
            ${renderModals()}
        </div>

        <!-- Screen Reader Region -->
        <div id="sr-live-region" class="sr-only" aria-live="polite" aria-atomic="true"></div>
    `;
}

// Render authentication card
function renderAuthCard() {
    return `
        <div style="display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap">
            <div style="min-width:240px;flex:1">
                <label class="muted">Email</label>
                <input id="email" type="email" placeholder="admin@example.com" style="width:100%" />
            </div>
            <div style="min-width:220px;flex:1">
                <label class="muted">Password</label>
                <input id="password" type="password" placeholder="password" style="width:100%" />
            </div>

            <div style="min-width:160px">
                <label class="muted">Select Year</label>
                <select id="loginYearSelect" style="width:100%;"></select>
            </div>

            <div style="display:flex;gap:8px;align-items:center;margin-top:20px">
                <button id="login-btn" class="btn">Login</button>
            </div>
        </div>
        <div class="muted note" style="margin-top:10px">
            Use email/password login. Admin UID for edits: <code>fRpLuiBgU0ZE1AtVmkGaA1RhBJk2</code>
        </div>
    `;
}

// Render dashboard overview
function renderDashboardOverview() {
    return `
        <div class="card">
            <h3>📊 Dashboard Overview</h3>
            <div class="summary-cards">
                <div class="summary-card-item">
                    <div style="font-size: 24px; font-weight: bold; color: var(--primary-red);" id="total-invitations">0</div>
                    <div style="font-size: 14px; color: var(--muted);">Total Invitations</div>
                </div>
                <div class="summary-card-item">
                    <div style="font-size: 24px; font-weight: bold; color: var(--primary-red);" id="total-members">0</div>
                    <div style="font-size: 14px; color: var(--muted);">Total Members</div>
                </div>
                <div class="summary-card-item">
                    <div style="font-size: 24px; font-weight: bold; color: var(--primary-red);" id="pending-invitations">0</div>
                    <div style="font-size: 14px; color: var(--muted);">Pending Invitations</div>
                </div>
                <div class="summary-card-item">
                    <div style="font-size: 24px; font-weight: bold; color: var(--primary-red);" id="active-collectors">0</div>
                    <div style="font-size: 14px; color: var(--muted);">Active Collectors</div>
                </div>
            </div>
        </div>
    `;
}

// Render financial overview
function renderFinancialOverview() {
    return `
        <div class="card">
            <h3>💰 Financial Overview (<span id="financial-year-display">2025</span>)</h3>
            <div class="financial-overview-cards">
                <div class="financial-card income">
                    <div style="font-size: 24px; font-weight: bold;" id="total-income">₹0</div>
                    <div style="font-size: 14px; opacity: 0.9;">Total Income</div>
                </div>
                <div class="financial-card expense">
                    <div style="font-size: 24px; font-weight: bold;" id="total-expenses">₹0</div>
                    <div style="font-size: 14px; opacity: 0.9;">Total Expenses</div>
                </div>
                <div class="financial-card net">
                    <div style="font-size: 24px; font-weight: bold;" id="net-balance">₹0</div>
                    <div style="font-size: 14px; opacity: 0.9;">Net Balance</div>
                </div>
                <div class="summary-card-item">
                    <div style="font-size: 24px; font-weight: bold; color: var(--accent-gold);" id="budget-utilization">0%</div>
                    <div style="font-size: 14px; color: var(--muted);">Budget Used</div>
                </div>
            </div>
        </div>
    `;
}

// Render quick actions
function renderQuickActions() {
    return `
        <div class="card">
            <h3>⚡ Quick Actions</h3>
            <div class="quick-actions">
                <button class="btn small" onclick="exportAllData()">📊 Export All Data</button>
                <button class="btn small secondary" onclick="exportInvitationsBulk()">📋 Export Invitations</button>
                <button class="btn small ghost" onclick="generateFinancialReport()">📊 Financial Report</button>
                <button class="btn small" onclick="backupData()">💾 Backup Data</button>
                <button class="btn small secondary" onclick="showAllYearsData()">📅 View All Years</button>
                <button class="btn small" onclick="showBulkUploadModal()">📤 Bulk Upload</button>
                <button class="btn small secondary" onclick="showTransactionModal('income')">💰 Add Income</button>
                <button class="btn small" onclick="showTransactionModal('expense')">💸 Add Expense</button>
            </div>
        </div>
    `;
}

// Render recent activity
function renderRecentActivity() {
    return `
        <div class="card">
            <h3>🕒 Recent Activity</h3>
            <div id="recent-activity" style="max-height: 200px; overflow-y: auto;"></div>
        </div>
    `;
}

// Render year information
function renderYearInfo() {
    return `
        <div class="card" id="year-info-card">
            <h3>📅 Currently Viewing: <span id="current-year-display">2025</span> <span class="year-info" id="year-data-status">Loading...</span></h3>
            <div class="subtitle" id="year-data-description">Viewing membership fees and financial data for selected year. Other data (invitations, members) shows all years.</div>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button class="btn small secondary" onclick="loadAllYearsFees()">🔄 Load Fees from All Years</button>
                <button class="btn small ghost" onclick="showYearComparison()">📊 Compare Years</button>
            </div>
        </div>
    `;
}

// Render budget tracker
function renderBudgetTracker() {
    return `
        <div class="card" id="budget-tracker">
            <h2>🎯 Budget Overview (<span id="budget-year-display">2025</span>)</h2>
            <div class="subtitle">Track budget vs actual spending for Durga Puja</div>

            <div class="budget-grid" id="budget-cards-container"></div>

            <div style="margin-top: 20px;">
                <canvas id="budgetChart" height="100"></canvas>
            </div>
        </div>
    `;
}

// Render financial tracker
function renderFinancialTracker() {
    return `
        <div class="card" id="financial-tracker">
            <h2>💰 Income & Expense Tracker (<span id="financial-tracker-year-display">2025</span>)</h2>
            <div class="subtitle">Track all Durga Puja financial transactions</div>

            <div class="quick-actions" style="margin-bottom: 15px;">
                <button class="btn small secondary" onclick="showTransactionModal('income')">➕ Add Income</button>
                <button class="btn small" onclick="showTransactionModal('expense')">➖ Add Expense</button>
                <button class="btn small ghost" onclick="loadFinancialData()">🔄 Refresh</button>
            </div>

            <div class="advanced-filters">
                <select id="filter-transaction-type" onchange="filterTransactions()">
                    <option value="all">All Transactions</option>
                    <option value="income">Income Only</option>
                    <option value="expense">Expense Only</option>
                </select>
                <select id="filter-transaction-category" onchange="filterTransactions()">
                    <option value="all">All Categories</option>
                </select>
                <input type="date" id="filter-transaction-from" onchange="filterTransactions()" placeholder="From Date">
                <input type="date" id="filter-transaction-to" onchange="filterTransactions()" placeholder="To Date">
            </div>

            <table id="transactions-table" style="margin-top: 12px;">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Payment Mode</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>

            <div style="margin-top: 15px; padding: 15px; background: var(--glass); border-radius: var(--radius);">
                <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                    <div><strong>Total Income:</strong> <span id="table-total-income" style="color: #28a745;">₹0</span></div>
                    <div><strong>Total Expenses:</strong> <span id="table-total-expenses" style="color: #dc3545;">₹0</span></div>
                    <div><strong>Net Balance:</strong> <span id="table-net-balance" style="color: var(--primary-red);">₹0</span></div>
                </div>
            </div>
        </div>
    `;
}

// Render invitations section
function renderInvitationsSection() {
    return `
        <div class="card" id="invitations">
            <h2>🪔 Invitation List <span class="year-info">All Years</span></h2>
            <div class="subtitle">Add, search and track invitation card distribution (shows data from all years)</div>

            <div class="bulk-upload-section">
                <h4>📤 Bulk Upload Invitations</h4>
                <div class="upload-options">
                    <button onclick="showBulkUploadModal()" class="btn small">📝 Paste Data</button>
                    <button onclick="downloadUploadTemplate()" class="btn small secondary">📋 Download Template</button>
                    <input type="file" id="fileUpload" accept=".txt,.csv" style="display: none" onchange="handleFileUpload(this.files[0])">
                    <button onclick="document.getElementById('fileUpload').click()" class="btn small">📁 Upload File</button>
                </div>
                <div class="muted note">Supported formats: Plain text with "|" separator, CSV files, or table data</div>
            </div>

            <div class="advanced-filters">
                <select id="filter-village" style="min-width: 150px;">
                    <option value="">All Villages</option>
                    <option value="Madhabpur">Madhabpur</option>
                    <option value="Paldhui">Paldhui</option>
                    <option value="Sabitrapur">Sabitrapur</option>
                    <option value="Lalupool">Lalupool</option>
                    <option value="Mahakal">Mahakal</option>
                    <option value="Others">Others</option>
                </select>
                <select id="filter-status" style="min-width: 150px;">
                    <option value="">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                </select>
                <input type="date" id="filter-date-from" placeholder="From Date">
                <input type="date" id="filter-date-to" placeholder="To Date">
            </div>

            <div style="display:flex;gap:12px;margin-top:12px;align-items:center">
                <input id="search-invite" type="text" placeholder="Search invitations (name / village / mobile)..." style="flex:1" />
                <div class="muted">Admin can add/edit/delete</div>
            </div>

            <table id="invitation-table" style="margin-top:12px">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Village</th>
                        <th>Mobile</th>
                        <th>Remarks</th>
                        <th>Sent</th>
                        <th>Date Added</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>

            <div style="margin-top:12px">
                <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
                    <input id="inv-name" type="text" placeholder="Name" style="min-width:180px" />
                    <input id="inv-village" type="text" placeholder="Village" style="min-width:160px" />
                    <input id="inv-mobile" type="text" placeholder="Mobile No" style="min-width:140px" />
                    <input id="inv-remarks" type="text" placeholder="Remarks" style="min-width:200px" />
                    <button id="add-inv-btn" class="btn small">Add Invitation</button>
                </div>
            </div>
        </div>
    `;
}

// Render members section
function renderMembersSection() {
    return `
        <div class="card" id="members">
            <h2>🌸 Members List <span class="year-info">All Years</span></h2>
            <div class="subtitle">Manage members — linked to membership fee tracker (shows data from all years)</div>

            <div style="display:flex;gap:12px;margin-top:12px;align-items:center">
                <input id="search-members" type="text" placeholder="Search members (name/mobile)..." style="flex:1" />
                <div class="muted">Admin can add/edit/delete</div>
            </div>

            <table id="members-table" style="margin-top:12px">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Village</th>
                        <th>Mobile</th>
                        <th>Remarks</th>
                        <th>Date Added</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>

            <div style="margin-top:12px">
                <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
                    <input id="mem-name" type="text" placeholder="Name" style="min-width:180px" />
                    <input id="mem-village" type="text" placeholder="Village" style="min-width:160px" />
                    <input id="mem-mobile" type="text" placeholder="Mobile No" style="min-width:140px" />
                    <input id="mem-remarks" type="text" placeholder="Remarks" style="min-width:200px" />
                    <button id="add-mem-btn" class="btn small">Add Member</button>
                </div>
            </div>
        </div>
    `;
}

// Render membership fees section
function renderMembershipFeesSection() {
    return `
        <div class="card" id="fees">
            <h2>💰 Membership Fees Tracker (<span id="fees-year-display">2025</span>)</h2>
            <div class="subtitle">Track monthly payments (₹ per month configurable) - Year-specific data</div>

            <div style="display:flex;gap:12px;align-items:center;margin-top:12px">
                <div style="min-width:260px">
                    <label class="muted">Member</label>
                    <select id="feeMemberSelect" style="width:100%"><option value="">-- Select member --</option></select>
                </div>

                <div style="min-width:140px">
                    <label class="muted">Monthly Fee (₹)</label>
                    <input id="feeAmountInput" type="number" min="1" value="100" style="width:100%" />
                </div>

                <div style="display:flex;gap:8px;align-items:center;margin-left:auto">
                    <button id="loadMemberFeeBtn" class="btn small">Load</button>
                    <button id="exportCsvBtn" class="btn small secondary">Export CSV</button>
                </div>
            </div>

            <table id="fee-months-table" style="margin-top:12px">
                <thead><tr><th>Month</th><th>Status</th><th>Paid On</th><th>Toggle (Admin)</th></tr></thead>
                <tbody></tbody>
            </table>

            <div style="display:flex;align-items:center;gap:12px;margin-top:12px">
                <div id="fee-member-summary" class="muted">Select member to load fees</div>
                <div style="margin-left:auto;display:flex;gap:8px">
                    <button id="saveFeeConfigBtn" class="btn small">Save Config</button>
                    <button id="clearFeeRecordBtn" class="btn small ghost">Clear</button>
                </div>
            </div>

            <div style="margin-top:12px">
                <h3 style="margin:0 0 8px 0;color:var(--primary-red);font-size:15px">Yearly Summary</h3>
                <table id="fees-yearly-summary">
                    <thead><tr><th>Month</th><th>Paid Members</th><th>Total Collected (₹)</th></tr></thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    `;
}

// Render paid tracker section
function renderPaidTrackerSection() {
    return `
        <div class="card" id="paid-tracker">
            <h2>💠 Paid Members Visual Tracker (<span id="paid-tracker-year-display">2025</span>)</h2>
            <div class="subtitle">Click to load paid status for selected year. Click column header "Member" to sort A→Z.</div>

            <div style="display:flex;gap:12px;align-items:center;margin-top:12px">
                <div style="min-width:220px">
                    <button id="show-paid-btn" class="btn small">Show Paid Members</button>
                    <button id="clear-paid-view" class="btn small ghost" style="margin-left:8px">Clear</button>
                </div>

                <div style="margin-left:auto">
                    <div id="paid-tracker-count" class="muted">Loaded: 0</div>
                </div>
            </div>

            <div id="paid-members-list" style="margin-top:14px;overflow:auto;"></div>
        </div>
    `;
}

// Render village collection section
function renderVillageCollectionSection() {
    return `
        <div class="card" id="village-collection">
            <h2>🏘️ Village Collection Tracker (<span id="village-collection-year-display">2025</span>)</h2>
            <div class="subtitle">Track donations per village and collector (year-specific data) - Data is copy-pasteable</div>

            <div class="bulk-upload-section">
                <h4>📤 Bulk Upload Village Collections</h4>
                <div class="upload-options">
                    <button onclick="showVillageBulkUploadModal()" class="btn small">📝 Paste Data</button>
                    <button onclick="downloadVillageUploadTemplate()" class="btn small secondary">📋 Download Template</button>
                    <input type="file" id="villageFileUpload" accept=".txt,.csv" style="display: none" onchange="handleVillageFileUpload(this.files[0])">
                    <button onclick="document.getElementById('villageFileUpload').click()" class="btn small">📁 Upload File</button>
                    <button class="btn small secondary" onclick="exportVillageCollectionBulk()">📋 Copy Data</button>
                </div>
                <div class="muted note">Supported formats: Plain text with "|" separator, CSV files, or table data</div>
            </div>

            <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:12px">
                <input id="vc-bill" type="text" placeholder="Bill No" style="min-width:120px" />
                <select id="vc-collector" style="min-width:160px"><option value="">-- Select Collector --</option></select>
                <input id="vc-donor" type="text" placeholder="Donor Name" style="min-width:160px" />
                <input id="vc-amount" type="number" placeholder="Amount (₹)" style="min-width:120px" />
                <input id="vc-remarks" type="text" placeholder="Remarks" style="min-width:200px" />
                <select id="vc-village" style="min-width:160px">
                    <option value="">-- Select Village --</option>
                    <option value="Madhabpur">Madhabpur</option>
                    <option value="Paldhui">Paldhui</option>
                    <option value="Sabitrapur">Sabitrapur</option>
                    <option value="Lalupool">Lalupool</option>
                    <option value="Mahakal">Mahakal</option>
                    <option value="Others">Others</option>
                </select>
                <button id="add-vc-btn" class="btn small">Add Collection</button>
            </div>

            <div id="vc-total-collection" class="total-collection" style="display:none;">
                Total Village Collection: ₹<span id="vc-total-amount">0</span>
            </div>

            <div class="card" style="margin-top: 15px;">
                <h3>🏘️ Village-wise Collection</h3>
                <div id="village-breakdown" class="village-breakdown"></div>
            </div>

            <div class="card" style="margin-top: 15px;">
                <h3>📈 Monthly Collection Trend</h3>
                <canvas id="collectionChart" height="100"></canvas>
            </div>

            <table id="vc-table" style="margin-top:12px">
                <thead>
                    <tr>
                        <th>Bill No</th>
                        <th>Collector</th>
                        <th>Donor Name</th>
                        <th>Amount (₹)</th>
                        <th>Remarks</th>
                        <th>Village</th>
                        <th>Date Added</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>

            <input id="search-vc" type="text" placeholder="Search collections..." style="margin-top:12px;width:100%;padding:8px;border-radius:8px;border:1px solid #ccc;" />
        </div>
    `;
}

// Render modals
function renderModals() {
    return `
        <!-- Bulk Upload Modal for Invitations -->
        <div id="bulkUploadModal" class="modal-overlay hidden">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📤 Bulk Upload Invitations</h3>
                    <button class="modal-close" onclick="closeBulkUploadModal()">&times;</button>
                </div>
                <div class="bulk-upload-section">
                    <div class="upload-options">
                        <button onclick="downloadUploadTemplate()" class="btn small secondary">📋 Download Template</button>
                        <input type="file" id="modalFileUpload" accept=".txt,.csv" style="display: none" onchange="handleFileUpload(this.files[0])">
                        <button onclick="document.getElementById('modalFileUpload').click()" class="btn small">📁 Upload File</button>
                    </div>
                    <div style="margin: 15px 0;">
                        <label class="muted">Paste your data here (use template format):</label>
                        <textarea id="bulkUploadTextarea" class="upload-textarea" placeholder="Paste data in format: Name | Village | Amount | Mobile | Remarks&#10;Sanjay Manna | Madhabpur | 1000 | 9876543210 | Regular donor&#10;Santosh Payra | Paldhui | 1000 | 9876543211 | "></textarea>
                    </div>
                    <div id="uploadPreview" class="upload-preview hidden"></div>
                    <div id="uploadProgress" class="hidden">
                        <div class="progress-bar"><div id="progressFill" class="progress-fill" style="width: 0%"></div></div>
                        <div id="progressText" class="progress-text">Processing...</div>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        <button id="processUploadBtn" class="btn" onclick="processBulkUpload()" disabled>✅ Process Upload</button>
                        <button class="btn ghost" onclick="closeBulkUploadModal()">❌ Cancel</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add other modals similarly -->
    `;
}

// Add activity to recent activity feed
function addActivity(message, type = 'info') {
    const activityDiv = document.getElementById('recent-activity');
    if (!activityDiv) return;
    
    const activityItem = document.createElement('div');
    activityItem.className = `activity-item ${type}`;
    activityItem.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>${message}</span>
            <small style="color: var(--muted);">${new Date().toLocaleTimeString()}</small>
        </div>
    `;
    activityDiv.insertBefore(activityItem, activityDiv.firstChild);
    
    // Keep only last 10 activities
    if (activityDiv.children.length > 10) {
        activityDiv.removeChild(activityDiv.lastChild);
    }
}

// Export component functions
window.Components = {
    renderAppStructure,
    addActivity
};
