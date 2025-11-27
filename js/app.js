/* ==================== MAIN APPLICATION ENTRY POINT ==================== */

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Club Bornoporichoy Dashboard...');
    initializeApp();
});

// Main application initialization
async function initializeApp() {
    try {
        // Initialize authentication system
        initializeAuthSystem();
        
        // Populate initial year dropdowns
        populateYearDropdowns();
        
        // Set up initial event listeners
        setupInitialEventListeners();
        
        // Check browser compatibility
        checkBrowserCompatibility();
        
        console.log('✅ Club Bornoporichoy Dashboard initialized successfully');
        
        // Add initial activity
        setTimeout(() => {
            if (auth.currentUser) {
                addActivity('Dashboard initialized successfully', 'success');
                addActivity(`Global year set to ${selectedYear}`, 'info');
            } else {
                addActivity('Welcome to Club Bornoporichoy Dashboard! Please log in.', 'info');
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        showErrorScreen(error);
    }
}

// Initialize collection chart
function initCollectionChart() {
    const ctx = document.getElementById('collectionChart');
    if (!ctx) {
        console.warn('Collection chart canvas not found');
        return;
    }
    
    collectionChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: MONTHS,
            datasets: [{
                label: 'Monthly Collection (₹)',
                data: Array(12).fill(0),
                borderColor: '#B71C1C',
                backgroundColor: 'rgba(183, 28, 28, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                }
            }
        }
    });
}

// Initialize budget chart
function initBudgetChart() {
    const ctx = document.getElementById('budgetChart');
    if (!ctx) return;
    
    budgetChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: Object.keys(BUDGET_ITEMS),
            datasets: [
                {
                    label: 'Budget',
                    data: Object.values(BUDGET_ITEMS),
                    backgroundColor: 'rgba(183, 28, 28, 0.6)',
                    borderColor: 'rgba(183, 28, 28, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Actual Spent',
                    data: Array(Object.keys(BUDGET_ITEMS).length).fill(0),
                    backgroundColor: 'rgba(212, 175, 55, 0.6)',
                    borderColor: 'rgba(212, 175, 55, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ₹${context.raw.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// Set up initial event listeners
function setupInitialEventListeners() {
    // Global keyboard shortcuts
    document.addEventListener('keydown', handleGlobalKeyboardShortcuts);
    
    // Performance monitoring
    setupPerformanceMonitoring();
}

// Handle global keyboard shortcuts
function handleGlobalKeyboardShortcuts(e) {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        focusSearchInput();
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        closeAllModals();
    }
}

// Focus search input
function focusSearchInput() {
    const searchInput = document.getElementById('search-invite');
    if (searchInput) {
        searchInput.focus();
        searchInput.select();
    }
}

// Close all modals
function closeAllModals() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        if (!modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
        }
    });
}

// Setup performance monitoring
function setupPerformanceMonitoring() {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.duration > 50) {
                    console.warn('Long task detected:', entry);
                }
            });
        });
        
        observer.observe({ entryTypes: ['longtask'] });
    }
}

// Check browser compatibility
function checkBrowserCompatibility() {
    const features = {
        firestore: 'firebase' in window && 'firestore' in firebase,
        promises: 'Promise' in window,
        fetch: 'fetch' in window,
        intersectionObserver: 'IntersectionObserver' in window,
    };
    
    const missingFeatures = Object.entries(features)
        .filter(([_, supported]) => !supported)
        .map(([name]) => name);
    
    if (missingFeatures.length > 0) {
        console.warn('Missing browser features:', missingFeatures);
        
        if (!features.intersectionObserver) {
            console.warn('IntersectionObserver not supported, loading all charts immediately');
            // Load charts immediately if IntersectionObserver is not supported
            setTimeout(() => {
                if (!collectionChart) initCollectionChart();
                if (!budgetChart) initBudgetChart();
            }, 1000);
        }
        
        if (!features.promises) {
            showNotification('Your browser may not support all features. Please update for best experience.', 'warning', 10000);
        }
    }
}

// Show error screen
function showErrorScreen(error) {
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = `
            <div style="padding: 50px; text-align: center; color: var(--primary-red);">
                <h1>⚠️ Application Error</h1>
                <p>Failed to initialize the dashboard. Please refresh the page.</p>
                <p style="color: var(--muted); font-size: 14px;">Error: ${error.message}</p>
                <button onclick="location.reload()" class="btn" style="margin-top: 20px;">
                    🔄 Reload Application
                </button>
            </div>
        `;
    }
}

// Global error handler for uncaught errors
window.addEventListener('error', function(e) {
    console.error('Global error caught:', e.error);
    
    // Don't show notification for known errors
    if (e.error && e.error.message && e.error.message.includes('firebase')) {
        return; // Firebase errors are handled separately
    }
    
    showNotification('An unexpected error occurred. Check console for details.', 'error');
});

// Make core functions globally available
window.showTransactionModal = showTransactionModal;
window.closeTransactionModal = closeTransactionModal;
window.saveTransaction = saveTransaction;
window.showBulkUploadModal = showBulkUploadModal;
window.closeBulkUploadModal = closeBulkUploadModal;
window.loadFeeMembersDropdown = loadFeeMembersDropdown;
window.generateFinancialReport = generateFinancialReport;
window.loadFinancialData = loadFinancialData;
window.filterTransactions = filterTransactions;
window.exportAllData = exportAllData;
window.backupData = backupData;
window.showAllYearsData = showAllYearsData;
window.exportInvitationsBulk = exportInvitationsBulk;

// Development helpers
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Add development tools
    window.dev = {
        clearCache: () => {
            cache.clear();
            console.log('🗑️ Cache cleared');
            showNotification('Cache cleared', 'info');
        },
        
        forceReload: () => {
            clearCache('');
            loadAllData();
            loadFinancialData();
            console.log('🔄 Forced reload');
            showNotification('Forced reload completed', 'info');
        },
        
        showState: () => {
            console.log('📊 App State:', {
                user: auth.currentUser,
                year: selectedYear,
                role: currentRole,
                cacheEntries: Array.from(cache.keys())
            });
        }
    };
    
    console.log('🔧 Development tools available: window.dev');
}

console.log('🎯 Club Bornoporichoy Dashboard loaded successfully!');
