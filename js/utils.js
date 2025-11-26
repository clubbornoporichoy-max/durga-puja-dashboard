/* ==================== UTILITY FUNCTIONS ==================== */

// HTML escaping
function escapeHtml(s) { 
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); 
}

// Safe DOM element helper
function safeSetTextContent(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    } else {
        console.warn(`Element with id '${elementId}' not found`);
    }
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Toast notification system
function showToast(msg, ttl = 2500) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerText = msg;
    container.appendChild(t);
    
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { 
        t.classList.remove('show'); 
        setTimeout(() => container.removeChild(t), 300); 
    }, ttl);
}

// Enhanced notification system
function showNotification(message, type = 'info', duration = 5000) {
    // Remove existing notifications of same type
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        if (notification.textContent.includes(message)) {
            notification.remove();
        }
    });

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after duration
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, duration);
}

// File download utility
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Table filtering
function filterTable(tableId, term) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const rows = table.querySelectorAll("tbody tr");
    const q = (term || "").toLowerCase();
    rows.forEach(r => {
        if (r) r.style.display = r.innerText.toLowerCase().includes(q) ? "" : "none";
    });
}

// Debounced table filter
const debouncedFilterTable = debounce(filterTable, 300);

// Data caching system
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function withCache(key, operation, ttl = CACHE_TTL) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
        console.log(`Cache hit for: ${key}`);
        return Promise.resolve(cached.data);
    }
    
    return operation().then(data => {
        cache.set(key, { data, timestamp: Date.now() });
        console.log(`Cache set for: ${key}`);
        return data;
    });
}

function clearCache(pattern) {
    let cleared = 0;
    for (const key of cache.keys()) {
        if (key.includes(pattern)) {
            cache.delete(key);
            cleared++;
        }
    }
    console.log(`Cleared ${cleared} cache entries for pattern: ${pattern}`);
}

// Loading state management
function withLoading(button, operation) {
    return async (...args) => {
        const originalText = button.textContent;
        const originalHTML = button.innerHTML;
        button.innerHTML = '<span class="loading-spinner"></span> Loading...';
        button.disabled = true;
        button.classList.add('loading');
        
        try {
            const result = await operation(...args);
            return result;
        } finally {
            button.innerHTML = originalHTML;
            button.textContent = originalText;
            button.disabled = false;
            button.classList.remove('loading');
        }
    };
}

// Error handling wrapper
function withFirebaseErrorHandling(operation, customMessage) {
    return async (...args) => {
        try {
            return await operation(...args);
        } catch (error) {
            console.error(`Firebase ${operation.name} error:`, error);
            
            if (error.code === 'permission-denied') {
                showNotification('Permission denied: You cannot perform this action', 'error');
            } else if (error.code === 'unavailable') {
                showNotification('Network error: Please check your connection', 'error');
            } else if (error.code === 'not-found') {
                showNotification('Data not found', 'error');
            } else {
                showNotification(customMessage || 'Operation failed', 'error');
            }
            throw error;
        }
    };
}

// Clear all tables
function clearAllTables() {
    ["invitation-table", "members-table", "monthly-summary-table", "fee-months-table", "fees-yearly-summary", "vc-table", "transactions-table"].forEach(id => {
        const tb = document.getElementById(id)?.querySelector("tbody");
        if (tb) tb.innerHTML = "";
    });
}

// Enhanced search with specific columns
function enhancedFilterTable(tableId, term, searchColumns = []) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const rows = table.querySelectorAll("tbody tr");
    const q = (term || "").toLowerCase().trim();
    
    if (!q) {
        rows.forEach(r => r.style.display = "");
        return;
    }
    
    requestAnimationFrame(() => {
        let visibleCount = 0;
        rows.forEach(r => {
            let match = false;
            const cells = r.querySelectorAll('td');
            
            if (searchColumns.length > 0) {
                searchColumns.forEach(colIndex => {
                    if (cells[colIndex] && cells[colIndex].textContent.toLowerCase().includes(q)) {
                        match = true;
                    }
                });
            } else {
                match = r.textContent.toLowerCase().includes(q);
            }
            
            r.style.display = match ? "" : "none";
            if (match) visibleCount++;
        });
        
        // Update table info if available
        const tableInfo = table.parentNode.querySelector('.table-info');
        if (tableInfo) {
            tableInfo.textContent = `Showing ${visibleCount} of ${rows.length} records`;
        }
    });
}
