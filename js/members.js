/* ==================== MEMBERS MANAGEMENT MODULE ==================== */

let editingMemberId = null;

// Initialize members management
function initializeMembersManagement() {
    console.log('Initializing members management...');
    
    // Set up event listeners
    setupMembersEventListeners();
    
    // Load initial data
    loadMembers();
}

// Set up members event listeners
function setupMembersEventListeners() {
    // Add member button
    const addMemBtn = document.getElementById("add-mem-btn");
    if (addMemBtn) {
        addMemBtn.addEventListener("click", addMember);
    }
    
    // Search functionality is handled in modules.js
}

// Load members
async function loadMembers() {
    const tbody = document.querySelector("#members-table tbody");
    if (!tbody) {
        console.error("Members table body not found");
        return;
    }
    
    tbody.innerHTML = "";
    
    try {
        const snapshot = await withCache('members', () => membersCol.orderBy("name").get());
        let total = 0;
        
        snapshot.forEach(doc => {
            total++;
            const d = doc.data();
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${escapeHtml(d.name || "")}</td>
                <td>${escapeHtml(d.village || "")}</td>
                <td>${escapeHtml(d.mobile || "")}</td>
                <td>${escapeHtml(d.remarks || "")}</td>
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
                editBtn.onclick = () => showEditMemberModal(doc.id, d);
                actionsTd.appendChild(editBtn);

                // Delete button
                const delBtn = document.createElement("button");
                delBtn.textContent = "🗑️ Delete";
                delBtn.className = "btn small ghost";
                delBtn.onclick = () => deleteMember(doc.id, d.name);
                actionsTd.appendChild(delBtn);
            } else {
                actionsTd.innerHTML = '<span class="muted">View only</span>';
            }
        });
        
        console.log(`Loaded ${total} members`);
        
    } catch (error) {
        console.error("Load members error:", error);
        showNotification('Error loading members: ' + error.message, 'error');
    }
}

// Add member
async function addMember() {
    if (currentRole !== "admin") {
        showNotification("Only admin can add members", "error");
        return;
    }
    
    const name = document.getElementById("mem-name").value.trim();
    const village = document.getElementById("mem-village").value.trim();
    const mobile = document.getElementById("mem-mobile").value.trim();
    const remarks = document.getElementById("mem-remarks").value.trim();
    
    if (!name || !village) {
        showNotification("Name & Village are required", "error");
        return;
    }
    
    try {
        // Check for duplicates
        let dupQuery = membersCol.where("name", "==", name);
        if (mobile) dupQuery = dupQuery.where("mobile", "==", mobile);
        const dup = await dupQuery.get();
        
        if (!dup.empty && !confirm("Possible duplicate found. Add anyway?")) return;
        
        await membersCol.add({
            name, 
            village, 
            mobile, 
            remarks,
            dateAdded: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Clear form
        ["mem-name", "mem-village", "mem-mobile", "mem-remarks"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });
        
        showNotification("Member added successfully", "success");
        addActivity(`Added member ${name} from ${village}`, 'success');
        
        // Reload data
        loadMembers();
        loadFeeMembersDropdown();
        updateSummaryCards();
        
    } catch (error) {
        console.error("Add member error:", error);
        showNotification("Failed to add member: " + error.message, "error");
        addActivity(`Failed to add member: ${error.message}`, 'error');
    }
}

// Show edit member modal
function showEditMemberModal(memberId, memberData) {
    editingMemberId = memberId;
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('editMemberModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'editMemberModal';
        modal.className = 'modal-overlay hidden';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>✏️ Edit Member</h3>
                    <button class="modal-close" onclick="closeEditMemberModal()">&times;</button>
                </div>
                <div style="display: grid; gap: 15px; margin-top: 15px;">
                    <div>
                        <label class="muted">Name *</label>
                        <input type="text" id="edit-mem-name" placeholder="Member Name" style="width: 100%;">
                    </div>
                    <div>
                        <label class="muted">Village *</label>
                        <input type="text" id="edit-mem-village" placeholder="Village" style="width: 100%;">
                    </div>
                    <div>
                        <label class="muted">Mobile</label>
                        <input type="text" id="edit-mem-mobile" placeholder="Mobile Number" style="width: 100%;">
                    </div>
                    <div>
                        <label class="muted">Remarks</label>
                        <textarea id="edit-mem-remarks" placeholder="Remarks" style="width: 100%; min-height: 80px;"></textarea>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button class="btn" onclick="saveMemberEdit()">💾 Save Changes</button>
                    <button class="btn ghost" onclick="closeEditMemberModal()">❌ Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Populate form with current data
    document.getElementById('edit-mem-name').value = memberData.name || '';
    document.getElementById('edit-mem-village').value = memberData.village || '';
    document.getElementById('edit-mem-mobile').value = memberData.mobile || '';
    document.getElementById('edit-mem-remarks').value = memberData.remarks || '';
    
    modal.classList.remove('hidden');
}

// Close edit member modal
function closeEditMemberModal() {
    const modal = document.getElementById('editMemberModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    editingMemberId = null;
}

// Save member edits
async function saveMemberEdit() {
    if (!editingMemberId) return;
    
    const name = document.getElementById('edit-mem-name').value.trim();
    const village = document.getElementById('edit-mem-village').value.trim();
    const mobile = document.getElementById('edit-mem-mobile').value.trim();
    const remarks = document.getElementById('edit-mem-remarks').value.trim();
    
    if (!name || !village) {
        showNotification('Name and Village are required', 'error');
        return;
    }
    
    try {
        await membersCol.doc(editingMemberId).update({
            name,
            village,
            mobile,
            remarks,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showNotification('Member updated successfully', 'success');
        addActivity(`Updated member: ${name}`, 'success');
        
        closeEditMemberModal();
        loadMembers();
        loadFeeMembersDropdown();
        
    } catch (error) {
        console.error('Error updating member:', error);
        showNotification('Error updating member: ' + error.message, 'error');
    }
}

// Delete member
async function deleteMember(memberId, memberName) {
    if (!confirm(`Are you sure you want to delete member ${memberName}?`)) return;
    
    try {
        await membersCol.doc(memberId).delete();
        
        showNotification("Member deleted successfully", "success");
        addActivity(`Deleted member ${memberName}`, 'info');
        
        loadMembers();
        loadFeeMembersDropdown();
        updateSummaryCards();
        
    } catch (error) {
        console.error('Error deleting member:', error);
        showNotification("Delete failed: " + error.message, "error");
    }
}

// Load fee members dropdown (used by membership fees module)
async function loadFeeMembersDropdown() {
    const select = document.getElementById("feeMemberSelect");
    const vcCollectorSelect = document.getElementById("vc-collector");
    
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Select member --</option>';
    if (vcCollectorSelect) {
        vcCollectorSelect.innerHTML = '<option value="">-- Select Collector --</option>';
    }
    
    try {
        const snapshot = await withCache('members', () => membersCol.orderBy("name").get());
        
        if (snapshot.empty) {
            console.log("No members found in database");
            return;
        }
        
        // Create a map to store member names by ID for quick lookup
        window.memberNamesMap = {};
        
        snapshot.forEach(doc => {
            const d = doc.data();
            const displayText = `${d.name} (${d.village})`;
            
            // Store in global map for later lookup
            window.memberNamesMap[doc.id] = d.name;
            
            // Add to fee member dropdown
            const option = document.createElement("option");
            option.value = doc.id;
            option.textContent = displayText;
            select.appendChild(option);
            
            // Also add to village collection collector dropdown
            if (vcCollectorSelect) {
                const collectorOption = document.createElement("option");
                collectorOption.value = doc.id;
                collectorOption.textContent = displayText;
                vcCollectorSelect.appendChild(collectorOption);
            }
        });
        
        console.log(`Loaded ${snapshot.size} members into dropdowns`);
        
    } catch (error) {
        console.error("Load fee members dropdown error:", error);
        showNotification('Error loading members dropdown: ' + error.message, 'error');
    }
}

// Export members functions
window.MembersManager = {
    initializeMembersManagement,
    loadMembers,
    addMember,
    loadFeeMembersDropdown,
    showEditMemberModal,
    closeEditMemberModal,
    saveMemberEdit,
    deleteMember
};
