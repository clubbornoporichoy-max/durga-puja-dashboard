/* ==================== INVITATIONS MANAGEMENT MODULE ==================== */

let editingInvitationId = null;

// Initialize invitations management
function initializeInvitationsManagement() {
    console.log('Initializing invitations management...');
    
    // Set up event listeners
    setupInvitationsEventListeners();
    
    // Load initial data
    loadInvitations();
}

// Set up invitations event listeners
function setupInvitationsEventListeners() {
    // Add invitation button
    const addInvBtn = document.getElementById("add-inv-btn");
    if (addInvBtn) {
        addInvBtn.addEventListener("click", addInvitation);
    }
    
    // Search functionality is handled in modules.js
}

// Load invitations
async function loadInvitations() {
    const tbody = document.querySelector("#invitation-table tbody");
    if (!tbody) {
        console.error("Invitations table body not found");
        return;
    }
    
    tbody.innerHTML = "";
    
    try {
        const snapshot = await withCache('invitations', () => invitationCol.orderBy("dateAdded", "desc").get());
        let total = 0;
        let sent = 0;
        
        snapshot.forEach(doc => {
            total++;
            const d = doc.data();
            if (d.sent) sent++;
            
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${escapeHtml(d.name || "")}</td>
                <td>${escapeHtml(d.village || "")}</td>
                <td>${escapeHtml(d.mobile || "")}</td>
                <td>${escapeHtml(d.remarks || "")}</td>
                <td class="center">${d.sent ? '<span class="badge ok">Sent</span>' : '<span class="badge warn">Pending</span>'}</td>
                <td>${d.dateAdded && d.dateAdded.toDate ? d.dateAdded.toDate().toLocaleDateString() : ""}</td>
                <td class="action-buttons"></td>
            `;
            tbody.appendChild(tr);

            const actionsTd = tr.querySelector("td:last-child");
            if (currentRole === "admin") {
                // Edit button
                const editBtn = document.createElement("button");
                editBtn.textContent = "✏️ Edit";
                editBtn.className = "btn small secondary";
                editBtn.style.marginRight = "5px";
                editBtn.onclick = () => showEditInvitationModal(doc.id, d);
                actionsTd.appendChild(editBtn);

                // Toggle sent status button
                const toggleBtn = document.createElement("button");
                toggleBtn.textContent = d.sent ? "↶ Mark Pending" : "✓ Mark Sent";
                toggleBtn.className = "btn small";
                toggleBtn.style.marginRight = "5px";
                toggleBtn.onclick = () => toggleInvitationStatus(doc.id, d.sent, d.name);
                actionsTd.appendChild(toggleBtn);

                // Delete button
                const delBtn = document.createElement("button");
                delBtn.textContent = "🗑️ Delete";
                delBtn.className = "btn small ghost";
                delBtn.onclick = () => deleteInvitation(doc.id, d.name);
                actionsTd.appendChild(delBtn);
            } else {
                actionsTd.innerHTML = '<span class="muted">View only</span>';
            }
        });
        
        console.log(`Loaded ${total} invitations (${sent} sent, ${total - sent} pending)`);
        
    } catch (error) {
        console.error("Load invitations error:", error);
        showNotification('Error loading invitations: ' + error.message, 'error');
    }
}

// Add invitation
async function addInvitation() {
    if (currentRole !== "admin") {
        showNotification("Only admin can add invitations", "error");
        return;
    }
    
    const name = document.getElementById("inv-name").value.trim();
    const village = document.getElementById("inv-village").value.trim();
    const mobile = document.getElementById("inv-mobile").value.trim();
    const remarks = document.getElementById("inv-remarks").value.trim();
    
    if (!name || !village) {
        showNotification("Name & Village are required", "error");
        return;
    }
    
    try {
        // Check for duplicates
        let dupQuery = invitationCol.where("name", "==", name);
        if (mobile) dupQuery = dupQuery.where("mobile", "==", mobile);
        const dup = await dupQuery.get();
        
        if (!dup.empty && !confirm("Possible duplicate found. Add anyway?")) return;
        
        await invitationCol.add({
            name, 
            village, 
            mobile, 
            remarks,
            sent: false,
            dateAdded: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Clear form
        ["inv-name", "inv-village", "inv-mobile", "inv-remarks"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });
        
        showNotification("Invitation added successfully", "success");
        addActivity(`Added invitation for ${name} from ${village}`, 'success');
        
        // Reload data
        loadInvitations();
        updateSummaryCards();
        
    } catch (error) {
        console.error("Add invitation error:", error);
        showNotification("Failed to add invitation: " + error.message, "error");
        addActivity(`Failed to add invitation: ${error.message}`, 'error');
    }
}

// Show edit invitation modal
function showEditInvitationModal(invitationId, invitationData) {
    editingInvitationId = invitationId;
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('editInvitationModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'editInvitationModal';
        modal.className = 'modal-overlay hidden';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>✏️ Edit Invitation</h3>
                    <button class="modal-close" onclick="closeEditInvitationModal()">&times;</button>
                </div>
                <div style="display: grid; gap: 15px; margin-top: 15px;">
                    <div>
                        <label class="muted">Name *</label>
                        <input type="text" id="edit-inv-name" placeholder="Name" style="width: 100%;">
                    </div>
                    <div>
                        <label class="muted">Village *</label>
                        <input type="text" id="edit-inv-village" placeholder="Village" style="width: 100%;">
                    </div>
                    <div>
                        <label class="muted">Mobile</label>
                        <input type="text" id="edit-inv-mobile" placeholder="Mobile Number" style="width: 100%;">
                    </div>
                    <div>
                        <label class="muted">Remarks</label>
                        <textarea id="edit-inv-remarks" placeholder="Remarks" style="width: 100%; min-height: 80px;"></textarea>
                    </div>
                    <div>
                        <label class="muted">Status</label>
                        <select id="edit-inv-sent" style="width: 100%;">
                            <option value="false">Pending</option>
                            <option value="true">Sent</option>
                        </select>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button class="btn" onclick="saveInvitationEdit()">💾 Save Changes</button>
                    <button class="btn ghost" onclick="closeEditInvitationModal()">❌ Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Populate form with current data
    document.getElementById('edit-inv-name').value = invitationData.name || '';
    document.getElementById('edit-inv-village').value = invitationData.village || '';
    document.getElementById('edit-inv-mobile').value = invitationData.mobile || '';
    document.getElementById('edit-inv-remarks').value = invitationData.remarks || '';
    document.getElementById('edit-inv-sent').value = invitationData.sent ? 'true' : 'false';
    
    modal.classList.remove('hidden');
}

// Close edit invitation modal
function closeEditInvitationModal() {
    const modal = document.getElementById('editInvitationModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    editingInvitationId = null;
}

// Save invitation edits
async function saveInvitationEdit() {
    if (!editingInvitationId) return;
    
    const name = document.getElementById('edit-inv-name').value.trim();
    const village = document.getElementById('edit-inv-village').value.trim();
    const mobile = document.getElementById('edit-inv-mobile').value.trim();
    const remarks = document.getElementById('edit-inv-remarks').value.trim();
    const sent = document.getElementById('edit-inv-sent').value === 'true';
    
    if (!name || !village) {
        showNotification('Name and Village are required', 'error');
        return;
    }
    
    try {
        await invitationCol.doc(editingInvitationId).update({
            name,
            village,
            mobile,
            remarks,
            sent,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showNotification('Invitation updated successfully', 'success');
        addActivity(`Updated invitation for ${name}`, 'success');
        
        closeEditInvitationModal();
        loadInvitations();
        updateSummaryCards();
        
    } catch (error) {
        console.error('Error updating invitation:', error);
        showNotification('Error updating invitation: ' + error.message, 'error');
    }
}

// Toggle invitation status
async function toggleInvitationStatus(invitationId, currentStatus, name) {
    try {
        await invitationCol.doc(invitationId).update({
            sent: !currentStatus,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showNotification(`Invitation marked as ${!currentStatus ? 'Sent' : 'Pending'}`, 'success');
        addActivity(`Updated invitation status for ${name}`, 'info');
        
        loadInvitations();
        updateSummaryCards();
        
    } catch (error) {
        console.error('Error toggling invitation status:', error);
        showNotification('Error updating invitation status: ' + error.message, 'error');
    }
}

// Delete invitation
async function deleteInvitation(invitationId, name) {
    if (!confirm(`Are you sure you want to delete invitation for ${name}?`)) return;
    
    try {
        await invitationCol.doc(invitationId).delete();
        
        showNotification("Invitation deleted successfully", "success");
        addActivity(`Deleted invitation for ${name}`, 'info');
        
        loadInvitations();
        updateSummaryCards();
        
    } catch (error) {
        console.error('Error deleting invitation:', error);
        showNotification("Delete failed: " + error.message, "error");
    }
}

// Bulk upload functions (placeholder implementations)
function showBulkUploadModal() {
    showNotification('Bulk upload feature coming soon!', 'info');
}

function closeBulkUploadModal() {
    showNotification('Close bulk upload modal', 'info');
}

function downloadUploadTemplate() {
    showNotification('Download template feature coming soon!', 'info');
}

function handleFileUpload(file) {
    showNotification('File upload feature coming soon!', 'info');
}

function processBulkUpload() {
    showNotification('Bulk upload processing feature coming soon!', 'info');
}

function exportInvitationsBulk() {
    showNotification('Export invitations feature coming soon!', 'info');
    addActivity('Export invitations triggered', 'info');
}

// Export invitations functions
window.InvitationsManager = {
    initializeInvitationsManagement,
    loadInvitations,
    addInvitation,
    showEditInvitationModal,
    closeEditInvitationModal,
    saveInvitationEdit,
    toggleInvitationStatus,
    deleteInvitation,
    showBulkUploadModal,
    closeBulkUploadModal,
    downloadUploadTemplate,
    handleFileUpload,
    processBulkUpload,
    exportInvitationsBulk
};
