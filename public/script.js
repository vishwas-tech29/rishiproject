// ===========================
// API CONFIGURATION
// ===========================
const API_BASE_URL = window.location.origin + '/api';
let authToken = localStorage.getItem('authToken');

// ===========================
// API HELPER FUNCTIONS
// ===========================
async function apiRequest(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
    };

    const config = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ===========================
// INVOICE API FUNCTIONS
// ===========================
const InvoiceAPI = {
    // Get all invoices
    getAll: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return await apiRequest(`/invoices?${queryString}`);
    },

    // Get single invoice
    getById: async (id) => {
        return await apiRequest(`/invoices/${id}`);
    },

    // Create invoice
    create: async (invoiceData) => {
        return await apiRequest('/invoices', {
            method: 'POST',
            body: JSON.stringify(invoiceData)
        });
    },

    // Update invoice
    update: async (id, invoiceData) => {
        return await apiRequest(`/invoices/${id}`, {
            method: 'PUT',
            body: JSON.stringify(invoiceData)
        });
    },

    // Delete invoice
    delete: async (id) => {
        return await apiRequest(`/invoices/${id}`, {
            method: 'DELETE'
        });
    },

    // Update status
    updateStatus: async (id, status) => {
        return await apiRequest(`/invoices/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    },

    // Get statistics
    getStats: async () => {
        return await apiRequest('/invoices/stats');
    },

    // Search invoices
    search: async (query) => {
        return await apiRequest(`/invoices/search/${encodeURIComponent(query)}`);
    }
};

// ===========================
// USER API FUNCTIONS
// ===========================
const UserAPI = {
    // Register
    register: async (userData) => {
        const response = await apiRequest('/users/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (response.success && response.data.token) {
            authToken = response.data.token;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response;
    },

    // Login
    login: async (credentials) => {
        const response = await apiRequest('/users/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });

        if (response.success && response.data.token) {
            authToken = response.data.token;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response;
    },

    // Logout
    logout: () => {
        authToken = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.reload();
    },

    // Get current user
    getMe: async () => {
        return await apiRequest('/users/me');
    },

    // Update profile
    updateProfile: async (userData) => {
        return await apiRequest('/users/me', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    },

    // Update password
    updatePassword: async (passwords) => {
        return await apiRequest('/users/password', {
            method: 'PUT',
            body: JSON.stringify(passwords)
        });
    }
};

// ===========================
// STATE MANAGEMENT
// ===========================
const invoiceState = {
    currentInvoice: null,
    invoices: [],
    lineItems: [
        'Custom Website Design & Development (Up to 5 Pages)',
        'Responsive & Mobile-Friendly Layout (optimized for all devices)',
        'User-Friendly Content Management System (CMS) (easy updates without coding)',
        'Contact Form Integration',
        'Google Maps Integration',
        'Basic On-Page SEO Setup (meta tags, headings, alt text, speed optimization)',
        'Social Media Integration (Facebook, Instagram, LinkedIn links/buttons)',
        'Image Optimization & Galleries (for better SEO and user experience)',
        'Training & Documentation'
    ]
};

// ===========================
// UTILITY FUNCTIONS
// ===========================
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getCurrentDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

function getDatePlusDays(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

function isAuthenticated() {
    return !!authToken;
}

function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// ===========================
// INITIALIZATION
// ===========================
document.addEventListener('DOMContentLoaded', function () {
    initializeDates();
    renderLineItems();
    updateInvoicePreview();
    attachEventListeners();
    checkAuthentication();
    addSaveToServerButton();
});

function checkAuthentication() {
    if (!isAuthenticated()) {
        console.log('⚠️ Not authenticated. Running in offline mode.');
        showNotification('Running in offline mode. Login to save invoices to cloud.', 'info');
    } else {
        const user = getCurrentUser();
        console.log('✅ Authenticated as:', user.name);
        showNotification(`Welcome back, ${user.name}!`, 'success');
        loadUserInvoices();
    }
}

function addSaveToServerButton() {
    const actionsSection = document.querySelector('.form-section:last-child');

    if (isAuthenticated()) {
        const saveButton = document.createElement('button');
        saveButton.className = 'btn-primary';
        saveButton.id = 'saveToServer';
        saveButton.innerHTML = '💾 Save to Cloud';
        saveButton.onclick = saveInvoiceToServer;

        const loadButton = document.createElement('button');
        loadButton.className = 'btn-secondary';
        loadButton.id = 'loadInvoices';
        loadButton.innerHTML = '📂 My Invoices';
        loadButton.onclick = showInvoicesList;

        actionsSection.insertBefore(loadButton, actionsSection.firstChild);
        actionsSection.insertBefore(saveButton, actionsSection.firstChild);
    } else {
        const loginButton = document.createElement('button');
        loginButton.className = 'btn-primary';
        loginButton.innerHTML = '🔐 Login to Save Online';
        loginButton.onclick = showLoginModal;

        actionsSection.insertBefore(loginButton, actionsSection.firstChild);
    }
}

// ===========================
// SAVE TO SERVER
// ===========================
async function saveInvoiceToServer() {
    if (!isAuthenticated()) {
        showNotification('Please login to save invoices online', 'error');
        return;
    }

    try {
        const invoiceData = exportInvoiceData();

        let response;
        if (invoiceState.currentInvoice) {
            // Update existing
            response = await InvoiceAPI.update(invoiceState.currentInvoice, invoiceData);
        } else {
            // Create new
            response = await InvoiceAPI.create(invoiceData);
            invoiceState.currentInvoice = response.data._id;
        }

        showNotification('Invoice saved to cloud successfully! ☁️', 'success');
    } catch (error) {
        showNotification('Failed to save invoice: ' + error.message, 'error');
    }
}

async function loadUserInvoices() {
    if (!isAuthenticated()) return;

    try {
        const response = await InvoiceAPI.getAll({ limit: 100 });
        invoiceState.invoices = response.data;
        console.log(`📊 Loaded ${response.data.length} invoices`);
    } catch (error) {
        console.error('Failed to load invoices:', error);
    }
}

function showInvoicesList() {
    // Create modal to show invoices list
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>My Invoices</h2>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            </div>
            <div class="modal-body">
                <div id="invoicesList">
                    ${invoiceState.invoices.length === 0
            ? '<p>No invoices found. Create your first invoice!</p>'
            : invoiceState.invoices.map(inv => `
                            <div class="invoice-item" onclick="loadInvoice('${inv._id}')">
                                <div class="invoice-item-header">
                                    <strong>${inv.invoice.number}</strong>
                                    <span class="status-badge status-${inv.invoice.status}">${inv.invoice.status}</span>
                                </div>
                                <div class="invoice-item-details">
                                    <p>${inv.client.name} - ${inv.project.name}</p>
                                    <p class="invoice-item-amount">${formatCurrency(inv.pricing.grandTotal)}</p>
                                </div>
                                <div class="invoice-item-date">${formatDate(inv.invoice.date)}</div>
                            </div>
                        `).join('')
        }
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

async function loadInvoice(id) {
    try {
        const response = await InvoiceAPI.getById(id);
        const invoice = response.data;

        importInvoiceData(invoice);
        invoiceState.currentInvoice = id;

        document.querySelector('.modal-overlay').remove();
        showNotification('Invoice loaded successfully!', 'success');
    } catch (error) {
        showNotification('Failed to load invoice: ' + error.message, 'error');
    }
}

function showLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Login / Register</h2>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="auth-tabs">
                    <button class="auth-tab active" onclick="showAuthTab('login')">Login</button>
                    <button class="auth-tab" onclick="showAuthTab('register')">Register</button>
                </div>
                
                <div id="loginForm" class="auth-form">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="loginEmail" placeholder="your@email.com">
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="loginPassword" placeholder="••••••••">
                    </div>
                    <button class="btn-primary" onclick="handleLogin()">Login</button>
                </div>
                
                <div id="registerForm" class="auth-form" style="display: none;">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" id="registerName" placeholder="Your Name">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="registerEmail" placeholder="your@email.com">
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="registerPassword" placeholder="••••••••">
                    </div>
                    <div class="form-group">
                        <label>Company Name (Optional)</label>
                        <input type="text" id="registerCompany" placeholder="Your Company">
                    </div>
                    <button class="btn-primary" onclick="handleRegister()">Register</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

window.showAuthTab = function (tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
};

window.handleLogin = async function () {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        await UserAPI.login({ email, password });
        document.querySelector('.modal-overlay').remove();
        showNotification('Login successful!', 'success');
        window.location.reload();
    } catch (error) {
        showNotification('Login failed: ' + error.message, 'error');
    }
};

window.handleRegister = async function () {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const companyName = document.getElementById('registerCompany').value;

    try {
        await UserAPI.register({
            name,
            email,
            password,
            company: { name: companyName }
        });
        document.querySelector('.modal-overlay').remove();
        showNotification('Registration successful!', 'success');
        window.location.reload();
    } catch (error) {
        showNotification('Registration failed: ' + error.message, 'error');
    }
};

window.loadInvoice = loadInvoice;

function initializeDates() {
    const dateInput = document.getElementById('invoiceDate');
    const validUntilInput = document.getElementById('validUntil');

    dateInput.value = getCurrentDate();
    validUntilInput.value = getDatePlusDays(5);
}

// ===========================
// LINE ITEMS MANAGEMENT
// ===========================
function renderLineItems() {
    const container = document.getElementById('lineItemsContainer');
    container.innerHTML = '';

    invoiceState.lineItems.forEach((item, index) => {
        const lineItemDiv = document.createElement('div');
        lineItemDiv.className = 'line-item';
        lineItemDiv.innerHTML = `
            <div class="line-item-header">
                <span class="line-item-number">Item ${index + 1}</span>
                <button class="btn-remove" onclick="removeLineItem(${index})">Remove</button>
            </div>
            <div class="form-group">
                <label>Description</label>
                <input type="text" 
                       class="line-item-input" 
                       data-index="${index}" 
                       value="${item}"
                       placeholder="Enter item description">
            </div>
        `;
        container.appendChild(lineItemDiv);
    });

    // Attach event listeners to line item inputs
    document.querySelectorAll('.line-item-input').forEach(input => {
        input.addEventListener('input', function () {
            const index = parseInt(this.dataset.index);
            invoiceState.lineItems[index] = this.value;
        });
    });
}

function removeLineItem(index) {
    if (invoiceState.lineItems.length <= 1) {
        alert('You must have at least one line item.');
        return;
    }

    invoiceState.lineItems.splice(index, 1);
    renderLineItems();
    updateInvoicePreview();
}

function addLineItem() {
    invoiceState.lineItems.push('New Item');
    renderLineItems();
    updateInvoicePreview();
}

// ===========================
// INVOICE PREVIEW UPDATE
// ===========================
function updateInvoicePreview() {
    // Company Details
    document.getElementById('displayCompanyName').textContent =
        document.getElementById('companyName').value;
    document.getElementById('displayTagline').textContent =
        document.getElementById('companyTagline').value;
    document.getElementById('logoIcon').textContent =
        document.getElementById('logoText').value;

    // Invoice Details
    document.getElementById('displayQuotationNumber').textContent =
        document.getElementById('quotationNumber').value;
    document.getElementById('displayDate').textContent =
        formatDate(document.getElementById('invoiceDate').value);
    document.getElementById('displayValidUntil').textContent =
        formatDate(document.getElementById('validUntil').value);

    // Client Details
    document.getElementById('displayClientName').textContent =
        document.getElementById('clientName').value;
    document.getElementById('displayClientCompany').textContent =
        document.getElementById('clientCompany').value;
    document.getElementById('displayClientAddress').textContent =
        document.getElementById('clientAddress').value;
    document.getElementById('displayClientContact').textContent =
        document.getElementById('clientContact').value;

    // Project Details
    document.getElementById('displayProjectName').textContent =
        document.getElementById('projectName').value;
    document.getElementById('displayDelivery').textContent =
        document.getElementById('deliveryTime').value;
    document.getElementById('displayMaintenance').textContent =
        document.getElementById('maintenance').value;

    // Line Items Table
    const tableBody = document.getElementById('itemsTableBody');
    tableBody.innerHTML = '';

    const itemsCell = document.createElement('td');
    const ul = document.createElement('ul');

    invoiceState.lineItems.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        ul.appendChild(li);
    });

    itemsCell.appendChild(ul);

    const totalCell = document.createElement('td');
    const packageCost = parseFloat(document.getElementById('packageCost').value) || 0;
    totalCell.textContent = formatCurrency(packageCost);

    const row = document.createElement('tr');
    row.appendChild(itemsCell);
    row.appendChild(totalCell);
    tableBody.appendChild(row);

    // Pricing
    const discountAmount = parseFloat(document.getElementById('discountAmount').value) || 0;
    const grandTotal = packageCost - discountAmount;

    document.getElementById('displayPackageCost').textContent = formatCurrency(packageCost);
    document.getElementById('displayDiscountName').textContent =
        document.getElementById('discountName').value;
    document.getElementById('displayDiscountAmount').textContent =
        '- ' + formatCurrency(discountAmount);
    document.getElementById('displayGrandTotal').textContent = formatCurrency(grandTotal);
}

// ===========================
// EVENT LISTENERS
// ===========================
function attachEventListeners() {
    // Update Invoice Button
    document.getElementById('updateInvoice').addEventListener('click', function () {
        updateInvoicePreview();
        showNotification('Invoice updated successfully!', 'success');
    });

    // Add Line Item Button
    document.getElementById('addLineItem').addEventListener('click', function () {
        addLineItem();
    });

    // Print Invoice Button
    document.getElementById('printInvoice').addEventListener('click', function () {
        window.print();
    });

    // Reset Form Button
    document.getElementById('resetForm').addEventListener('click', function () {
        if (confirm('Are you sure you want to reset to default values?')) {
            resetToDefault();
        }
    });

    // Toggle Panel Button
    document.getElementById('togglePanel').addEventListener('click', function () {
        const panel = document.getElementById('controlPanel');
        panel.classList.toggle('hidden');
    });

    // Auto-update on input changes
    const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
    formInputs.forEach(input => {
        input.addEventListener('input', debounce(updateInvoicePreview, 500));
    });
}

// ===========================
// RESET FUNCTIONALITY
// ===========================
function resetToDefault() {
    // Reset company details
    document.getElementById('companyName').value = 'PRANAYUV TECHNOLOGIES PVT LTD';
    document.getElementById('companyTagline').value = 'Empowering Lives through Innovation';
    document.getElementById('logoText').value = 'PV';

    // Reset invoice details
    document.getElementById('quotationNumber').value = 'Q2025001';
    initializeDates();

    // Reset client details
    document.getElementById('clientName').value = 'Apna Advertising';
    document.getElementById('clientCompany').value = 'Apna Advertising Pvt Ltd';
    document.getElementById('clientAddress').value = 'Pahar Ganj, New Delhi 110055';
    document.getElementById('clientContact').value = '9389271138';

    // Reset project details
    document.getElementById('projectName').value = 'Website development (Up to 5 pages)';
    document.getElementById('deliveryTime').value = '3-4 weeks from advance & assets';
    document.getElementById('maintenance').value = '18 months included (1 hour/month basic updates)';

    // Reset line items
    invoiceState.lineItems = [
        'Custom Website Design & Development (Up to 5 Pages)',
        'Responsive & Mobile-Friendly Layout (optimized for all devices)',
        'User-Friendly Content Management System (CMS) (easy updates without coding)',
        'Contact Form Integration',
        'Google Maps Integration',
        'Basic On-Page SEO Setup (meta tags, headings, alt text, speed optimization)',
        'Social Media Integration (Facebook, Instagram, LinkedIn links/buttons)',
        'Image Optimization & Galleries (for better SEO and user experience)',
        'Training & Documentation'
    ];

    // Reset pricing
    document.getElementById('packageCost').value = '20000';
    document.getElementById('discountName').value = 'Inaugural Client Discount (FIRST50)';
    document.getElementById('discountAmount').value = '8000';

    invoiceState.currentInvoice = null;
    renderLineItems();
    updateInvoicePreview();
    showNotification('Reset to default values', 'info');
}

// ===========================
// EXPORT/IMPORT
// ===========================
function exportInvoiceData() {
    const data = {
        company: {
            name: document.getElementById('companyName').value,
            tagline: document.getElementById('companyTagline').value,
            logo: document.getElementById('logoText').value
        },
        invoice: {
            number: document.getElementById('quotationNumber').value,
            date: document.getElementById('invoiceDate').value,
            validUntil: document.getElementById('validUntil').value
        },
        client: {
            name: document.getElementById('clientName').value,
            company: document.getElementById('clientCompany').value,
            address: document.getElementById('clientAddress').value,
            contact: document.getElementById('clientContact').value
        },
        project: {
            name: document.getElementById('projectName').value,
            delivery: document.getElementById('deliveryTime').value,
            maintenance: document.getElementById('maintenance').value
        },
        items: invoiceState.lineItems.map(item => ({ description: item })),
        pricing: {
            packageCost: parseFloat(document.getElementById('packageCost').value),
            discountName: document.getElementById('discountName').value,
            discountAmount: parseFloat(document.getElementById('discountAmount').value)
        }
    };

    return data;
}

function importInvoiceData(data) {
    // Import company details
    document.getElementById('companyName').value = data.company.name;
    document.getElementById('companyTagline').value = data.company.tagline;
    document.getElementById('logoText').value = data.company.logo;

    // Import invoice details
    document.getElementById('quotationNumber').value = data.invoice.number;
    document.getElementById('invoiceDate').value = data.invoice.date.split('T')[0];
    document.getElementById('validUntil').value = data.invoice.validUntil.split('T')[0];

    // Import client details
    document.getElementById('clientName').value = data.client.name;
    document.getElementById('clientCompany').value = data.client.company;
    document.getElementById('clientAddress').value = data.client.address;
    document.getElementById('clientContact').value = data.client.contact;

    // Import project details
    document.getElementById('projectName').value = data.project.name;
    document.getElementById('deliveryTime').value = data.project.delivery;
    document.getElementById('maintenance').value = data.project.maintenance;

    // Import line items
    invoiceState.lineItems = data.items.map(item => item.description);

    // Import pricing
    document.getElementById('packageCost').value = data.pricing.packageCost;
    document.getElementById('discountName').value = data.pricing.discountName;
    document.getElementById('discountAmount').value = data.pricing.discountAmount;

    renderLineItems();
    updateInvoicePreview();
}

// ===========================
// UTILITY FUNCTIONS
// ===========================
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

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        background: type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196F3',
        color: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '10000',
        animation: 'slideInRight 0.3s ease',
        fontWeight: '500'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    }
    
    .modal-content {
        background: white;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e0e0e0;
    }
    
    .modal-header h2 {
        margin: 0;
        color: var(--primary-blue);
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 2rem;
        cursor: pointer;
        color: #666;
        line-height: 1;
    }
    
    .modal-body {
        padding: 1.5rem;
    }
    
    .auth-tabs {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
    }
    
    .auth-tab {
        flex: 1;
        padding: 0.75rem;
        border: none;
        background: #f5f5f5;
        cursor: pointer;
        border-radius: 6px;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    
    .auth-tab.active {
        background: var(--primary-blue);
        color: white;
    }
    
    .invoice-item {
        padding: 1rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        margin-bottom: 0.75rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .invoice-item:hover {
        border-color: var(--primary-blue);
        box-shadow: 0 2px 8px rgba(59, 89, 152, 0.1);
    }
    
    .invoice-item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    
    .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .status-draft { background: #ffd54f; color: #000; }
    .status-sent { background: #4fc3f7; color: #000; }
    .status-paid { background: #81c784; color: #000; }
    .status-cancelled { background: #e57373; color: #fff; }
    
    .invoice-item-details {
        font-size: 0.9rem;
        color: #666;
    }
    
    .invoice-item-amount {
        font-weight: 700;
        color: var(--primary-blue);
        font-size: 1.1rem;
    }
    
    .invoice-item-date {
        font-size: 0.8rem;
        color: #999;
        margin-top: 0.5rem;
    }
`;
document.head.appendChild(style);

console.log('✅ Full-Stack Invoice Generator loaded successfully!');
console.log('💡 Features:');
console.log('   - 💾 Save invoices to cloud database');
console.log('   - 📂 Load and manage multiple invoices');
console.log('   - 🔐 User authentication');
console.log('   - 🌐 RESTful API integration');
