// ===========================
// STATE MANAGEMENT
// ===========================
const invoiceState = {
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

// ===========================
// INITIALIZATION
// ===========================
document.addEventListener('DOMContentLoaded', function() {
    initializeDates();
    renderLineItems();
    updateInvoicePreview();
    attachEventListeners();
});

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
        input.addEventListener('input', function() {
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
    document.getElementById('updateInvoice').addEventListener('click', function() {
        updateInvoicePreview();
        showNotification('Invoice updated successfully!', 'success');
    });
    
    // Add Line Item Button
    document.getElementById('addLineItem').addEventListener('click', function() {
        addLineItem();
    });
    
    // Print Invoice Button
    document.getElementById('printInvoice').addEventListener('click', function() {
        window.print();
    });
    
    // Reset Form Button
    document.getElementById('resetForm').addEventListener('click', function() {
        if (confirm('Are you sure you want to reset to default values?')) {
            resetToDefault();
        }
    });
    
    // Toggle Panel Button
    document.getElementById('togglePanel').addEventListener('click', function() {
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
    
    renderLineItems();
    updateInvoicePreview();
    showNotification('Reset to default values', 'info');
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
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
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
    
    // Remove after 3 seconds
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
`;
document.head.appendChild(style);

// ===========================
// KEYBOARD SHORTCUTS
// ===========================
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + P for Print
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        window.print();
    }
    
    // Ctrl/Cmd + S for Update
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        updateInvoicePreview();
        showNotification('Invoice updated!', 'success');
    }
    
    // Escape to toggle panel
    if (e.key === 'Escape') {
        const panel = document.getElementById('controlPanel');
        panel.classList.toggle('hidden');
    }
});

// ===========================
// EXPORT FUNCTIONALITY
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
        items: invoiceState.lineItems,
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
    document.getElementById('invoiceDate').value = data.invoice.date;
    document.getElementById('validUntil').value = data.invoice.validUntil;
    
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
    invoiceState.lineItems = data.items;
    
    // Import pricing
    document.getElementById('packageCost').value = data.pricing.packageCost;
    document.getElementById('discountName').value = data.pricing.discountName;
    document.getElementById('discountAmount').value = data.pricing.discountAmount;
    
    renderLineItems();
    updateInvoicePreview();
}

// ===========================
// LOCAL STORAGE
// ===========================
function saveToLocalStorage() {
    const data = exportInvoiceData();
    localStorage.setItem('invoiceData', JSON.stringify(data));
    showNotification('Invoice saved locally', 'success');
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('invoiceData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            importInvoiceData(data);
            showNotification('Invoice loaded from local storage', 'info');
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }
}

// Auto-save every 30 seconds
setInterval(saveToLocalStorage, 30000);

// Load saved data on page load
window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('new')) {
        loadFromLocalStorage();
    }
});

console.log('✅ Invoice Generator loaded successfully!');
console.log('💡 Keyboard shortcuts:');
console.log('   - Ctrl/Cmd + P: Print invoice');
console.log('   - Ctrl/Cmd + S: Update invoice');
console.log('   - Escape: Toggle control panel');
