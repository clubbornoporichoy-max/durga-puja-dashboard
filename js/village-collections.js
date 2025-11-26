/* ==================== VILLAGE COLLECTIONS MODULE ==================== */

let editingCollectionId = null;

// Initialize village collections management
function initializeVillageCollections() {
    console.log('Initializing village collections...');
    
    // Set up event listeners
    setupVillageCollectionsEventListeners();
    
    // Load initial data
    loadVillageCollections();
}

// Set up village collections event listeners
function setupVillageCollectionsEventListeners() {
    // Add collection button
    const addVcBtn = document.getElementById('add-vc-btn');
    if (addVcBtn) {
        addVcBtn.addEventListener('click', addVillageCollection);
    }
    
    // Search functionality is handled in modules.js
}

// Load village collections
async function loadVillageCollections() {
    const tbody = document.querySelector('#vc-table tbody');
    if (!tbody) return;

    try {
        tbody.innerHTML = '';
        
        let totalAmount = 0;
        let collectionsData = [];

        if (selectedYear === 'all') {
            // Aggregate from all years
            if (Object.keys(allYearsVillageData).length === 0) {
                await loadAllYearsVillageCollections();
            }
            
            Object.values(allYearsVillageData).forEach(yearData => {
                Object.entries(yearData).forEach(([id, data]) => {
                    collectionsData.push({ id, ...data });
                });
            });
        } else {
            // Single year
            const targetYear = selectedYear === 'all' ? new Date().getFullYear() : selectedYear;
            const villageCol = villageCollectionsCollectionFor(targetYear);
            const snap = await villageCol.orderBy('dateAdded', 'desc').get();
            snap.forEach(doc => {
                collectionsData.push({ id: doc.id, ...doc.data() });
            });
        }

        collectionsData.forEach(collection => {
            const d = collection;
            totalAmount += d.amount || 0;
            
            // Get collector name from our memberNamesMap
            const collectorName = window.memberNamesMap && window.memberNamesMap[d.collectorId] ? 
                window.memberNamesMap[d.collectorId] : d.collectorId;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escapeHtml(d.bill || '')}</td>
                <td>${escapeHtml(collectorName)}</td>
                <td>${escapeHtml(d.donor || '')}</td>
                <td>₹${(d.amount || 0).toLocaleString()}</td>
                <td>${escapeHtml(d.remarks || '')}</td>
                <td>${escapeHtml(d.village || '')}</td>
                <td>${d.dateAdded && d.dateAdded.toDate ? d.dateAdded.toDate().toLocaleDateString() : ''}</td>
                <td class="action-buttons"></td>
            `;
            tbody.appendChild(tr);

            const actionsTd = tr.querySelector('td:last-child');
            if (currentRole === 'admin') {
                // Edit button
                const editBtn = document.createElement('button');
                editBtn.textContent = '✏️ Edit';
                editBtn.className = 'btn small secondary';
                editBtn.style.marginRight = '5px';
                editBtn.onclick = () => showEditCollectionModal(collection.id, d);
                actionsTd.appendChild(editBtn);

                // Delete button
                const delBtn = document.createElement('button');
                delBtn.textContent = '🗑️ Delete';
                delBtn.className = 'btn small ghost';
                delBtn.onclick = () => deleteCollection(collection.id, d.donor);
                actionsTd.appendChild(delBtn);
            } else {
                actionsTd.innerHTML = '<span class="muted">View only</span>';
            }
        });

        // Update total display
        const totalDisplay = document.getElementById('vc-total-amount');
        const totalContainer = document.getElementById('vc-total-collection');
        if (totalDisplay) totalDisplay.textContent = totalAmount.toLocaleString();
        if (totalContainer) totalContainer.style.display = totalAmount > 0 ? 'block' : 'none';

        // Update collection chart
        updateCollectionChart(collectionsData);

        console.log(`Loaded ${collectionsData.length} village collections totaling ₹${totalAmount}`);

    } catch (error) {
        console.error('Error loading village collections:', error);
        showNotification('Error loading village collections: ' + error.message, 'error');
    }
}

// Update collection chart
function updateCollectionChart(collectionsData) {
    if (!collectionChart) return;
    
    const monthlyData = Array(12).fill(0);
    collectionsData.forEach(collection => {
        if (collection.dateAdded && collection.dateAdded.toDate) {
            const month = collection.dateAdded.toDate().getMonth();
            monthlyData[month] += collection.amount || 0;
        }
    });
    
    collectionChart.data.datasets[0].data = monthlyData;
    collectionChart.update();
}

// Add village collection
async function addVillageCollection() {
    if (currentRole !== 'admin') {
        showNotification('Only admin can add collections', 'error');
        return;
    }

    const bill = document.getElementById('vc-bill').value.trim();
    const collectorId = document.getElementById('vc-collector').value;
    const donor = document.getElementById('vc-donor').value.trim();
    const amount = parseFloat(document.getElementById('vc-amount').value);
    const remarks = document.getElementById('vc-remarks').value.trim();
    const village = document.getElementById('vc-village').value;

    // Validation
    if (!bill || !collectorId || !donor || !amount || !village) {
        showNotification('Please fill all required fields', 'error');
        return;
    }

    if (amount <= 0) {
        showNotification('Amount must be greater than 0', 'error');
        return;
    }

    try {
        const targetYear = selectedYear === 'all' ? new Date().getFullYear() : selectedYear;
        await villageCollectionsCollectionFor(targetYear).add({
            bill,
            collectorId,
            donor,
            amount,
            remarks,
            village,
            dateAdded: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Clear form
        ['vc-bill', 'vc-donor', 'vc-amount', 'vc-remarks'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });

        showNotification('Collection added successfully', 'success');
        addActivity(`Added collection from ${donor} in ${village}`, 'success');
        
        // Reload data
        loadVillageCollections();
        recalcTotalCollected();
        
    } catch (error) {
        console.error('Error adding collection:', error);
        showNotification('Error adding collection: ' + error.message, 'error');
    }
}

// Show edit collection modal
function showEditCollectionModal(collectionId, collectionData) {
    editingCollectionId = collectionId;
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('editCollectionModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'editCollectionModal';
        modal.className = 'modal-overlay hidden';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>✏️ Edit Collection</h3>
                    <button class="modal-close" onclick="closeEditCollectionModal()">&times;</button>
                </div>
                <div style="display: grid; gap: 15px; margin-top: 15px;">
                    <div>
                        <label class="muted">Bill No *</label>
                        <input type="text" id="edit-vc-bill" placeholder="Bill Number" style="width: 100%;">
                    </div>
                    <div>
                        <label class="muted">Collector *</label>
                        <select id="edit-vc-collector" style="width: 100%;">
                            <option value="">-- Select Collector --</option>
                        </select>
                    </div>
                    <div>
                        <label class="muted">Donor Name *</label>
                        <input type="text" id="edit-vc-donor" placeholder="Donor Name" style="width: 100%;">
                    </div>
                    <div>
                        <label class="muted">Amount (₹) *</label>
                        <input type="number" id="edit-vc-amount" placeholder="Amount" style="width: 100%;">
                    </div>
                    <div>
                        <label class="muted">Village *</label>
                        <select id="edit-vc-village" style="width: 100%;">
                            <option value="">-- Select Village --</option>
                            <option value="Madhabpur">Madhabpur</option>
                            <option value="Paldhui">Paldhui</option>
                            <option value="Sabitrapur">Sabitrapur</option>
                            <option value="Lalupool">Lalupool</option>
                            <option value="Mahakal">Mahakal</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>
                    <div>
                        <label class="muted">Remarks</label>
                        <textarea id="edit-vc-remarks" placeholder="Remarks" style="width: 100%; min-height: 80px;"></textarea>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button class="btn" onclick="saveCollectionEdit()">💾 Save Changes</button>
                    <button class="btn ghost" onclick="closeEditCollectionModal()">❌ Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Populate collectors dropdown
    const collectorSelect = document.getElementById('edit-vc-collector');
    collectorSelect.innerHTML = '<option value="">-- Select Collector --</option>';
    if (window.memberNamesMap) {
        Object.entries(window.memberNamesMap).forEach(([id, name]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = name;
            collectorSelect.appendChild(option);
        });
    }
    
    // Populate form with current data
    document.getElementById('edit-vc-bill').value = collectionData.bill || '';
    document.getElementById('edit-vc-collector').value = collectionData.collectorId || '';
    document.getElementById('edit-vc-donor').value = collectionData.donor || '';
    document.getElementById('edit-vc-amount').value = collectionData.amount || '';
    document.getElementById('edit-vc-village').value = collectionData.village || '';
    document.getElementById('edit-vc-remarks').value = collectionData.remarks || '';
    
    modal.classList.remove('hidden');
}

// Close edit collection modal
function closeEditCollectionModal() {
    const modal = document.getElementById('editCollectionModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    editingCollectionId = null;
}

// Save collection edits
async function saveCollectionEdit() {
    if (!editingCollectionId) return;
    
    const bill = document.getElementById('edit-vc-bill').value.trim();
    const collectorId = document.getElementById('edit-vc-collector').value;
    const donor = document.getElementById('edit-vc-donor').value.trim();
    const amount = parseFloat(document.getElementById('edit-vc-amount').value);
    const village = document.getElementById('edit-vc-village').value;
    const remarks = document.getElementById('edit-vc-remarks').value.trim();
    
    // Validation
    if (!bill || !collectorId || !donor || !amount || !village) {
        showNotification('Please fill all required fields', 'error');
        return;
    }

    if (amount <= 0) {
        showNotification('Amount must be greater than 0', 'error');
        return;
    }
    
    try {
        const targetYear = selectedYear === 'all' ? new Date().getFullYear() : selectedYear;
        await villageCollectionsCollectionFor(targetYear).doc(editingCollectionId).update({
            bill,
            collectorId,
            donor,
            amount,
            village,
            remarks,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showNotification('Collection updated successfully', 'success');
        addActivity(`Updated collection from ${donor}`, 'success');
        
        closeEditCollectionModal();
        loadVillageCollections();
        recalcTotalCollected();
        
    } catch (error) {
        console.error('Error updating collection:', error);
        showNotification('Error updating collection: ' + error.message, 'error');
    }
}

// Delete collection
async function deleteCollection(collectionId, donorName) {
    if (!confirm(`Are you sure you want to delete collection from ${donorName}?`)) return;
    
    try {
        if (selectedYear === 'all') {
            showNotification('Cannot delete from "All Years" view. Switch to specific year.', 'error');
            return;
        }
        
        const targetYear = selectedYear === 'all' ? new Date().getFullYear() : selectedYear;
        await villageCollectionsCollectionFor(targetYear).doc(collectionId).delete();
        
        showNotification('Collection deleted successfully', 'success');
        addActivity(`Deleted collection record for ${donorName}`, 'info');
        
        loadVillageCollections();
        recalcTotalCollected();
        
    } catch (error) {
        console.error('Error deleting collection:', error);
        showNotification('Error deleting collection: ' + error.message, 'error');
    }
}

// Load all years village collections
async function loadAllYearsVillageCollections() {
    try {
        addActivity('Loading village collection data from all years...', 'info');
        
        allYearsVillageData = {};
        const years = [2024, 2025]; // Add all years you have data for
        
        for (const year of years) {
            try {
                const villageCol = villageCollectionsCollectionFor(year);
                const snap = await villageCol.get();
                if (!snap.empty) {
                    allYearsVillageData[year] = {};
                    snap.forEach(doc => {
                        allYearsVillageData[year][doc.id] = doc.data();
                    });
                }
            } catch (error) {
                console.log(`No village collection data found for year ${year} or collection doesn't exist`);
            }
        }
        
        showNotification('Loaded village collection data from all available years', 'success');
        addActivity('Village collection data loaded from all years', 'success');
        
    } catch (error) {
        console.error('Error loading all years village collections:', error);
        showNotification('Error loading village collection data from all years', 'error');
    }
}

// Bulk upload functions for village collections
function showVillageBulkUploadModal() {
    showNotification('Village bulk upload feature coming soon!', 'info');
}

function closeVillageBulkUploadModal() {
    showNotification('Close village bulk upload modal', 'info');
}

function downloadVillageUploadTemplate() {
    showNotification('Download village template feature coming soon!', 'info');
}

function handleVillageFileUpload(file) {
    showNotification('Village file upload feature coming soon!', 'info');
}

function processVillageBulkUpload() {
    showNotification('Village bulk upload processing feature coming soon!', 'info');
}

function exportVillageCollectionBulk() {
    showNotification('Export village collection feature coming soon!', 'info');
    addActivity('Export village collection triggered', 'info');
}

// Export village collections functions
window.VillageCollectionsManager = {
    initializeVillageCollections,
    loadVillageCollections,
    addVillageCollection,
    showEditCollectionModal,
    closeEditCollectionModal,
    saveCollectionEdit,
    deleteCollection,
    loadAllYearsVillageCollections,
    showVillageBulkUploadModal,
    closeVillageBulkUploadModal,
    downloadVillageUploadTemplate,
    handleVillageFileUpload,
    processVillageBulkUpload,
    exportVillageCollectionBulk
};
