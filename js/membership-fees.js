/* ==================== MEMBERSHIP FEES MODULE ==================== */

// Initialize membership fees management
function initializeMembershipFees() {
    console.log('Initializing membership fees...');
    
    // Set up event listeners
    setupMembershipFeesEventListeners();
    
    // Load initial data
    loadFeeMembersDropdown();
    loadFeeYearlySummary();
}

// Set up membership fees event listeners
function initMembershipFeesEvents() {
    console.log('Setting up membership fees events...');
    
    // Load member fee data when member is selected
    const feeMemberSelect = document.getElementById('feeMemberSelect');
    if (feeMemberSelect) {
        feeMemberSelect.addEventListener('change', function() {
            console.log('Member selected:', this.value);
            loadMemberFeeData(this.value);
        });
    }

    // Load button
    const loadMemberFeeBtn = document.getElementById('loadMemberFeeBtn');
    if (loadMemberFeeBtn) {
        loadMemberFeeBtn.addEventListener('click', function() {
            const memberSelect = document.getElementById('feeMemberSelect');
            if (memberSelect && memberSelect.value) {
                console.log('Load button clicked for member:', memberSelect.value);
                loadMemberFeeData(memberSelect.value);
            } else {
                showNotification('Please select a member first', 'error');
            }
        });
    }

    // Save config button
    const saveFeeConfigBtn = document.getElementById('saveFeeConfigBtn');
    if (saveFeeConfigBtn) {
        saveFeeConfigBtn.addEventListener('click', saveFeeConfiguration);
    }

    // Clear record button
    const clearFeeRecordBtn = document.getElementById('clearFeeRecordBtn');
    if (clearFeeRecordBtn) {
        clearFeeRecordBtn.addEventListener('click', clearFeeRecord);
    }

    // Export CSV button
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', exportFeesCSV);
    }

    // Show paid members button
    const showPaidBtn = document.getElementById("show-paid-btn");
    if (showPaidBtn) {
        showPaidBtn.addEventListener("click", loadPaidMembersTracker);
    }

    // Clear paid view button
    const clearPaidView = document.getElementById("clear-paid-view");
    if (clearPaidView) {
        clearPaidView.addEventListener("click", () => {
            const container = document.getElementById("paid-members-list");
            const countSpan = document.getElementById("paid-tracker-count");
            if (container) container.innerHTML = "<p>Click 'Show Paid Members' to load data</p>";
            if (countSpan) countSpan.textContent = "Loaded: 0";
        });
    }

    console.log('Membership fees events initialized successfully');
}

// Load member fee data
async function loadMemberFeeData(memberId) {
    console.log('Loading fee data for member:', memberId);
    
    if (!memberId) {
        const tbody = document.getElementById('fee-months-table')?.querySelector('tbody');
        if (tbody) tbody.innerHTML = '';
        const summaryEl = document.getElementById('fee-member-summary');
        if (summaryEl) summaryEl.textContent = 'Select member to load fees';
        return;
    }

    try {
        const memberDoc = await membersCol.doc(memberId).get();
        if (!memberDoc.exists) {
            showNotification('Member not found', 'error');
            return;
        }

        const memberData = memberDoc.data();
        const feeAmount = parseInt(document.getElementById('feeAmountInput').value) || 100;
        
        // Get fee record
        const targetYear = selectedYear === 'all' ? new Date().getFullYear() : selectedYear;
        const feesCol = membershipFeesCollectionFor(targetYear);
        const feeDoc = await feesCol.doc(memberId).get();
        
        let feeData = {};
        let needsMigration = false;
        
        if (feeDoc.exists) {
            feeData = feeDoc.data();
            console.log('Found existing fee data:', feeData);
            
            // Check if data uses old structure (nested months object)
            if (feeData.months && typeof feeData.months === 'object') {
                console.log('Detected OLD data structure, migrating to new structure...');
                needsMigration = true;
                feeData = migrateToNewStructure(feeData, memberId, memberData, feeAmount);
                
                // Save migrated data back to Firestore
                await feesCol.doc(memberId).set(feeData);
                console.log('Data migrated to new structure');
            }
        } else {
            // Initialize with default data using the NEW structure
            feeData = {
                memberId: memberId,
                memberName: memberData.name,
                memberVillage: memberData.village,
                monthlyFee: feeAmount,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Initialize all months as unpaid using NEW structure
            MONTHS.forEach(month => {
                feeData[month] = {
                    paid: false,
                    paidOn: null,
                    amount: feeAmount
                };
            });
            
            // Save the initial structure to Firestore
            await feesCol.doc(memberId).set(feeData);
            console.log('Created new fee record for member:', memberId);
        }

        // Update the table
        updateFeeTable(memberData, feeData, feeAmount);
        
    } catch (error) {
        console.error('Error loading member fee data:', error);
        showNotification('Error loading fee data: ' + error.message, 'error');
    }
}

// Migrate from old structure to new structure
function migrateToNewStructure(oldData, memberId, memberData, feeAmount) {
    const newData = {
        memberId: memberId,
        memberName: memberData.name || oldData.memberName,
        memberVillage: memberData.village || oldData.memberVillage,
        monthlyFee: oldData.feeAmount || feeAmount,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Migrate months data from old structure to new structure
    MONTHS.forEach(month => {
        const oldMonthData = oldData.months && oldData.months[month];
        if (oldMonthData) {
            newData[month] = {
                paid: oldMonthData.paid || false,
                paidOn: oldMonthData.paidAt || null,
                amount: oldMonthData.amount || oldData.feeAmount || feeAmount
            };
        } else {
            newData[month] = {
                paid: false,
                paidOn: null,
                amount: oldData.feeAmount || feeAmount
            };
        }
    });
    
    return newData;
}

// Update fee table
function updateFeeTable(memberData, feeData, feeAmount) {
    const tbody = document.getElementById('fee-months-table').querySelector('tbody');
    if (!tbody) {
        console.error('Fee months table tbody not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    let paidMonths = 0;
    let totalPaid = 0;

    console.log('Updating fee table with data:', feeData);

    MONTHS.forEach(month => {
        // Handle both old and new data structures
        let monthData;
        if (feeData[month]) {
            // New structure: direct month properties
            monthData = feeData[month];
        } else if (feeData.months && feeData.months[month]) {
            // Old structure: nested months object
            monthData = feeData.months[month];
        } else {
            // Default structure
            monthData = { paid: false, paidOn: null, amount: feeAmount };
        }
        
        const isPaid = monthData.paid === true;
        
        if (isPaid) {
            paidMonths++;
            totalPaid += monthData.amount || feeAmount;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight: bold;">${month}</td>
            <td>
                <span class="badge ${isPaid ? 'ok' : 'warn'}">
                    ${isPaid ? 'Paid' : 'Pending'}
                </span>
            </td>
            <td>${monthData.paidOn ? new Date(monthData.paidOn.seconds * 1000).toLocaleDateString() : '-'}</td>
            <td class="center"></td>
        `;

        // Add toggle button for admin
        const toggleTd = tr.querySelector('td:last-child');
        if (currentRole === 'admin') {
            const toggleBtn = document.createElement('button');
            toggleBtn.textContent = isPaid ? 'Mark Unpaid' : 'Mark Paid';
            toggleBtn.className = 'btn small';
            toggleBtn.onclick = () => togglePaymentStatus(feeData.memberId, month, !isPaid, feeAmount);
            toggleTd.appendChild(toggleBtn);
        }

        tbody.appendChild(tr);
    });

    // Update summary
    const summaryText = `${memberData.name} - ${paidMonths}/12 months paid (₹${totalPaid})`;
    const summaryEl = document.getElementById('fee-member-summary');
    if (summaryEl) {
        summaryEl.textContent = summaryText;
    }
    
    console.log(`Updated table: ${paidMonths} paid months, total ₹${totalPaid}`);
}

// Toggle payment status
async function togglePaymentStatus(memberId, month, paid, amount) {
    try {
        const targetYear = selectedYear === 'all' ? new Date().getFullYear() : selectedYear;
        const feesCol = membershipFeesCollectionFor(targetYear);
        
        const updateData = {
            [`${month}.paid`]: paid,
            [`${month}.amount`]: amount,
            monthlyFee: amount,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (paid) {
            updateData[`${month}.paidOn`] = firebase.firestore.FieldValue.serverTimestamp();
        } else {
            updateData[`${month}.paidOn`] = null;
        }

        await feesCol.doc(memberId).set(updateData, { merge: true });
        
        showNotification(`Payment status updated for ${month}`, 'success');
        addActivity(`Updated ${month} payment for member ID: ${memberId}`, 'info');
        
        // Reload the data
        loadMemberFeeData(memberId);
        loadFeeYearlySummary();
        recalcTotalCollected();
        
    } catch (error) {
        console.error('Error updating payment status:', error);
        showNotification('Error updating payment: ' + error.message, 'error');
    }
}

// Load yearly summary
async function loadFeeYearlySummary() {
    const tbody = document.querySelector('#fees-yearly-summary tbody');
    if (!tbody) return;

    try {
        tbody.innerHTML = '';
        
        let monthlyTotals = {};
        MONTHS.forEach(month => {
            monthlyTotals[month] = { paidCount: 0, totalAmount: 0 };
        });

        // Get fees data based on selected year
        let feesData = [];
        const targetYear = selectedYear === 'all' ? new Date().getFullYear() : selectedYear;
        
        if (selectedYear === 'all') {
            // Aggregate from all years
            if (Object.keys(allYearsFeesData).length === 0) {
                await loadAllYearsFees();
            }
            
            Object.values(allYearsFeesData).forEach(yearData => {
                Object.values(yearData).forEach(feeData => {
                    feesData.push(feeData);
                });
            });
        } else {
            // Single year
            const feesCol = membershipFeesCollectionFor(targetYear);
            const feesSnap = await feesCol.get();
            feesSnap.forEach(doc => {
                feesData.push(doc.data());
            });
        }

        console.log('Processing fees data for yearly summary:', feesData.length, 'records');

        // Calculate monthly totals - handle both data structures
        feesData.forEach(feeData => {
            MONTHS.forEach(month => {
                let monthData;
                if (feeData[month]) {
                    // New structure
                    monthData = feeData[month];
                } else if (feeData.months && feeData.months[month]) {
                    // Old structure
                    monthData = feeData.months[month];
                }
                
                if (monthData && monthData.paid) {
                    monthlyTotals[month].paidCount++;
                    monthlyTotals[month].totalAmount += monthData.amount || feeData.monthlyFee || feeData.feeAmount || 100;
                }
            });
        });

        // Populate table
        MONTHS.forEach(month => {
            const tr = document.createElement('tr');
            const data = monthlyTotals[month];
            tr.innerHTML = `
                <td style="font-weight: bold;">${month}</td>
                <td>${data.paidCount}</td>
                <td>₹${data.totalAmount.toLocaleString()}</td>
            `;
            tbody.appendChild(tr);
        });

        // Add total row
        const totalPaidCount = Object.values(monthlyTotals).reduce((sum, data) => sum + data.paidCount, 0);
        const totalAmount = Object.values(monthlyTotals).reduce((sum, data) => sum + data.totalAmount, 0);
        
        const totalTr = document.createElement('tr');
        totalTr.style.fontWeight = 'bold';
        totalTr.style.background = 'rgba(183,28,28,0.1)';
        totalTr.innerHTML = `
            <td>TOTAL</td>
            <td>${totalPaidCount}</td>
            <td>₹${totalAmount.toLocaleString()}</td>
        `;
        tbody.appendChild(totalTr);

        console.log('Yearly summary updated:', { totalPaidCount, totalAmount });

    } catch (error) {
        console.error('Error loading yearly summary:', error);
        tbody.innerHTML = '<tr><td colspan="3">Error loading data</td></tr>';
    }
}

// Save fee configuration
async function saveFeeConfiguration() {
    const memberSelect = document.getElementById('feeMemberSelect');
    const amountInput = document.getElementById('feeAmountInput');
    
    if (!memberSelect.value) {
        showNotification('Please select a member first', 'error');
        return;
    }

    const memberId = memberSelect.value;
    const monthlyFee = parseInt(amountInput.value) || 100;

    try {
        const targetYear = selectedYear === 'all' ? new Date().getFullYear() : selectedYear;
        const feesCol = membershipFeesCollectionFor(targetYear);
        const memberDoc = await membersCol.doc(memberId).get();
        
        if (!memberDoc.exists) {
            showNotification('Member not found', 'error');
            return;
        }

        const memberData = memberDoc.data();
        
        // Update the monthly fee for all future months
        const updateData = {
            monthlyFee: monthlyFee,
            memberName: memberData.name,
            memberVillage: memberData.village,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await feesCol.doc(memberId).set(updateData, { merge: true });
        
        showNotification('Fee configuration saved', 'success');
        addActivity(`Updated monthly fee to ₹${monthlyFee} for ${memberData.name}`, 'info');
        
        // Reload the data
        loadMemberFeeData(memberId);
        
    } catch (error) {
        console.error('Error saving fee configuration:', error);
        showNotification('Error saving configuration: ' + error.message, 'error');
    }
}

// Clear fee record
async function clearFeeRecord() {
    const memberSelect = document.getElementById('feeMemberSelect');
    
    if (!memberSelect.value) {
        showNotification('Please select a member first', 'error');
        return;
    }

    if (!confirm('Are you sure you want to clear all payment records for this member?')) {
        return;
    }

    const memberId = memberSelect.value;

    try {
        const targetYear = selectedYear === 'all' ? new Date().getFullYear() : selectedYear;
        const feesCol = membershipFeesCollectionFor(targetYear);
        const memberDoc = await membersCol.doc(memberId).get();
        
        if (!memberDoc.exists) {
            showNotification('Member not found', 'error');
            return;
        }

        const memberData = memberDoc.data();
        
        // Reset all months to unpaid
        const resetData = {
            monthlyFee: parseInt(document.getElementById('feeAmountInput').value) || 100,
            memberName: memberData.name,
            memberVillage: memberData.village,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        MONTHS.forEach(month => {
            resetData[month] = {
                paid: false,
                paidOn: null,
                amount: resetData.monthlyFee
            };
        });

        await feesCol.doc(memberId).set(resetData);
        
        showNotification('Payment records cleared', 'success');
        addActivity(`Cleared all payment records for ${memberData.name}`, 'info');
        
        // Reload the data
        loadMemberFeeData(memberId);
        loadFeeYearlySummary();
        recalcTotalCollected();
        
    } catch (error) {
        console.error('Error clearing fee record:', error);
        showNotification('Error clearing records: ' + error.message, 'error');
    }
}

// Export CSV
async function exportFeesCSV() {
    try {
        let feesData = [];
        const targetYear = selectedYear === 'all' ? new Date().getFullYear() : selectedYear;
        
        if (selectedYear === 'all') {
            // Aggregate from all years
            if (Object.keys(allYearsFeesData).length === 0) {
                await loadAllYearsFees();
            }
            
            Object.values(allYearsFeesData).forEach(yearData => {
                Object.entries(yearData).forEach(([memberId, feeData]) => {
                    feesData.push({ memberId, ...feeData });
                });
            });
        } else {
            // Single year
            const feesCol = membershipFeesCollectionFor(targetYear);
            const feesSnap = await feesCol.get();
            feesSnap.forEach(doc => {
                feesData.push({ memberId: doc.id, ...doc.data() });
            });
        }

        if (feesData.length === 0) {
            showNotification('No fee data to export', 'info');
            return;
        }

        // Create CSV content
        let csvContent = 'Member Name,Village,Monthly Fee,Total Paid Months,Total Amount\n';
        
        feesData.forEach(fee => {
            let paidMonths = 0;
            let totalAmount = 0;
            
            MONTHS.forEach(month => {
                if (fee[month] && fee[month].paid) {
                    paidMonths++;
                    totalAmount += fee[month].amount || fee.monthlyFee || 100;
                }
            });

            csvContent += `"${fee.memberName || 'Unknown'}","${fee.memberVillage || ''}",${fee.monthlyFee || 100},${paidMonths},${totalAmount}\n`;
        });

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const filename = `membership-fees-${selectedYear === 'all' ? 'all-years' : selectedYear}-${new Date().toISOString().split('T')[0]}.csv`;
        
        downloadBlob(blob, filename);
        
        showNotification('CSV exported successfully', 'success');
        addActivity(`Exported fees CSV for ${selectedYear === 'all' ? 'all years' : selectedYear}`, 'success');
        
    } catch (error) {
        console.error('Error exporting CSV:', error);
        showNotification('Error exporting CSV: ' + error.message, 'error');
    }
}

// Load all years fees
async function loadAllYearsFees() {
    try {
        addActivity('Loading fees data from all years...', 'info');
        
        allYearsFeesData = {};
        const years = [2024, 2025]; // Add all years you have data for
        
        for (const year of years) {
            try {
                const feesCol = membershipFeesCollectionFor(year);
                const snap = await feesCol.get();
                if (!snap.empty) {
                    allYearsFeesData[year] = {};
                    snap.forEach(doc => {
                        allYearsFeesData[year][doc.id] = doc.data();
                    });
                }
            } catch (error) {
                console.log(`No data found for year ${year} or collection doesn't exist`);
            }
        }
        
        showNotification('Loaded fees data from all available years', 'success');
        addActivity('Fees data loaded from all years', 'success');
        
    } catch (error) {
        console.error('Error loading all years fees:', error);
        showNotification('Error loading data from all years', 'error');
    }
}

// Load paid members tracker
async function loadPaidMembersTracker() {
    const container = document.getElementById("paid-members-list");
    const countSpan = document.getElementById("paid-tracker-count");
    if (!container) {
        console.error('Paid members container not found');
        return;
    }
    
    try {
        container.innerHTML = "<p>Loading paid members...</p>";
        console.log('Starting to load paid members tracker...');
        
        // Get all members
        const membersSnap = await withCache('members', () => membersCol.orderBy("name").get());
        const members = [];
        membersSnap.forEach(doc => {
            members.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`Found ${members.length} members`);
        
        if (members.length === 0) {
            container.innerHTML = "<p>No members found in database</p>";
            if (countSpan) countSpan.textContent = "Loaded: 0";
            return;
        }
        
        // Get fees data based on selected year
        let feesData = {};
        const targetYear = selectedYear === 'all' ? new Date().getFullYear() : selectedYear;
        console.log(`Loading fees for year: ${targetYear}`);
        
        try {
            const feesCol = membershipFeesCollectionFor(targetYear);
            const feesSnap = await feesCol.get();
            console.log(`Found ${feesSnap.size} fee records`);
            
            feesSnap.forEach(doc => {
                feesData[doc.id] = doc.data();
            });
        } catch (error) {
            console.log('No fee data found for selected year:', error);
        }
        
        // Create the tracker table
        let html = `
            <div style="overflow-x: auto;">
                <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5; cursor: pointer;" onclick="sortMembersTable()">Member</th>
                        `;
        
        // Add month headers
        MONTHS.forEach(month => {
            html += `<th style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5; text-align: center;">${month}</th>`;
        });
        
        html += `</tr></thead><tbody>`;
        
        // Sort members alphabetically
        members.sort((a, b) => a.name.localeCompare(b.name));
        
        let paidCount = 0;
        let membersWithPayments = 0;
        
        // Add member rows
        members.forEach(member => {
            const memberFees = feesData[member.id] || {};
            let memberPaidMonths = 0;
            
            html += `<tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">
                    ${escapeHtml(member.name)}<br>
                    <small style="color: #666;">${member.village}</small>
                </td>`;
            
            MONTHS.forEach(month => {
                // Check both data structures
                let isPaid = false;
                
                // NEW STRUCTURE: Check direct month properties
                if (memberFees[month] && memberFees[month].paid === true) {
                    isPaid = true;
                } 
                // OLD STRUCTURE: Check nested months object
                else if (memberFees.months && memberFees.months[month] && memberFees.months[month].paid === true) {
                    isPaid = true;
                }
                
                if (isPaid) memberPaidMonths++;
                
                html += `
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; background: ${isPaid ? '#d4edda' : '#f8d7da'};">
                        <div class="paid-box ${isPaid ? 'paid-yes' : 'paid-no'}" title="${month}: ${isPaid ? 'Paid' : 'Not Paid'}">
                            ${isPaid ? '✓' : '✗'}
                        </div>
                    </td>
                `;
            });
            
            html += `</tr>`;
            
            if (memberPaidMonths > 0) {
                paidCount += memberPaidMonths;
                membersWithPayments++;
            }
        });
        
        html += `</tbody></table></div>`;
        
        container.innerHTML = html;
        
        if (countSpan) {
            countSpan.textContent = `Loaded: ${members.length} members, ${membersWithPayments} with payments, ${paidCount} total payments`;
        }
        
        showNotification(`Loaded ${members.length} members payment status`, 'success');
        addActivity(`Loaded paid members tracker for ${selectedYear}`, 'info');
        
    } catch (error) {
        console.error("Load paid members tracker error:", error);
        container.innerHTML = `<p style="color: red;">Error loading paid members: ${error.message}</p>`;
        showNotification('Error loading paid members tracker: ' + error.message, 'error');
    }
}

// Sort members table (placeholder)
function sortMembersTable() {
    showNotification('Sorting feature coming soon!', 'info');
}

// Export membership fees functions
window.MembershipFeesManager = {
    initializeMembershipFees,
    initMembershipFeesEvents,
    loadMemberFeeData,
    loadFeeYearlySummary,
    saveFeeConfiguration,
    clearFeeRecord,
    exportFeesCSV,
    loadAllYearsFees,
    loadPaidMembersTracker
};
