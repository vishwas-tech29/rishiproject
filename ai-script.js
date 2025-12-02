// ========================================
// AI Business Automation - Main Script
// ========================================

class AIBusinessAutomation {
    constructor() {
        this.apiKey = localStorage.getItem('gemini_api_key') || '';
        this.currentView = 'quotation';
        this.quotations = JSON.parse(localStorage.getItem('quotations')) || [];
        this.invoices = JSON.parse(localStorage.getItem('invoices')) || [];
        this.lineItemCount = 0;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkApiKey();
        this.updateCharCount();
        this.setDefaultDates();
        this.loadHistory();
    }

    // ========================================
    // Event Listeners
    // ========================================

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchView(e.target.closest('.nav-btn').dataset.view));
        });

        // Template cards
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', (e) => this.loadTemplate(e.target.closest('.template-card').dataset.template));
        });

        // Quotation generation
        document.getElementById('generateQuotation')?.addEventListener('click', () => this.generateQuotation());
        document.getElementById('enhanceBtn')?.addEventListener('click', () => this.enhanceDescription());

        // Invoice generation
        document.getElementById('generateInvoice')?.addEventListener('click', () => this.generateInvoice());
        document.getElementById('addLineItem')?.addEventListener('click', () => this.addLineItem());
        document.getElementById('convertQuotation')?.addEventListener('click', () => this.convertQuotationToInvoice());

        // Character count
        document.getElementById('projectDescription')?.addEventListener('input', () => this.updateCharCount());

        // Download PDFs
        document.getElementById('downloadPDF')?.addEventListener('click', () => this.downloadPDF('quotation'));
        document.getElementById('downloadInvoicePDF')?.addEventListener('click', () => this.downloadPDF('invoice'));

        // API Key modal
        document.getElementById('saveApiKey')?.addEventListener('click', () => this.saveApiKey());
        document.getElementById('closeModal')?.addEventListener('click', () => this.closeModal());

        // History filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterHistory(e.target.dataset.filter));
        });
    }

    // ========================================
    // View Management
    // ========================================

    switchView(view) {
        this.currentView = view;

        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Update view containers
        document.querySelectorAll('.view-container').forEach(container => {
            container.classList.remove('active');
        });
        document.getElementById(`${view}View`).classList.add('active');

        // Load history if switching to history view
        if (view === 'history') {
            this.loadHistory();
        }
    }

    // ========================================
    // Template Management
    // ========================================

    loadTemplate(templateType) {
        const templates = {
            'web-dev': {
                description: 'I need a modern, responsive website with the following features:\n\n• Professional landing page with hero section\n• About us and services pages\n• Contact form with email integration\n• Mobile-responsive design\n• SEO optimization\n• Fast loading speed\n• Modern UI/UX design\n\nTarget audience: Business professionals and potential clients\nPreferred tech stack: React.js, Node.js, MongoDB',
                budget: '25000-50000'
            },
            'mobile-app': {
                description: 'I need a cross-platform mobile application with:\n\n• User authentication and profiles\n• Real-time data synchronization\n• Push notifications\n• In-app messaging\n• Payment gateway integration\n• Analytics dashboard\n• Offline mode support\n\nPlatforms: iOS and Android\nTech stack: React Native or Flutter',
                budget: '50000-100000'
            },
            'ai-solution': {
                description: 'I need an AI-powered solution with:\n\n• Machine learning model integration\n• Natural language processing\n• Predictive analytics\n• Custom AI chatbot\n• Data visualization dashboard\n• API integration\n• Scalable cloud infrastructure\n\nUse case: Business automation and customer insights\nTech stack: Python, TensorFlow, Google Cloud AI',
                budget: '100000+'
            },
            'consulting': {
                description: 'I need professional consulting services for:\n\n• Business strategy and planning\n• Digital transformation roadmap\n• Technology stack evaluation\n• Process optimization\n• Team training and workshops\n• Implementation support\n• Ongoing advisory services\n\nDuration: 3-6 months\nDeliverables: Strategy documents, implementation plan, training materials',
                budget: '50000-100000'
            }
        };

        const template = templates[templateType];
        if (template) {
            document.getElementById('projectDescription').value = template.description;
            document.getElementById('budgetRange').value = template.budget;
            this.updateCharCount();

            // Add visual feedback
            this.showNotification('Template loaded successfully!', 'success');
        }
    }

    // ========================================
    // AI Integration
    // ========================================

    async generateQuotation() {
        const description = document.getElementById('projectDescription').value.trim();
        const clientName = document.getElementById('clientName').value.trim();
        const clientEmail = document.getElementById('clientEmail').value.trim();
        const clientCompany = document.getElementById('clientCompany').value.trim();
        const budgetRange = document.getElementById('budgetRange').value;

        if (!description) {
            this.showNotification('Please enter a project description', 'error');
            return;
        }

        if (!this.apiKey) {
            this.showApiKeyModal();
            return;
        }

        this.showAIStatus('AI is analyzing your project...');

        try {
            const quotationData = await this.callGeminiAPI(description, budgetRange);

            const quotation = {
                id: this.generateId(),
                type: 'quotation',
                number: `QUO-${new Date().getFullYear()}-${String(this.quotations.length + 1).padStart(3, '0')}`,
                date: new Date().toISOString(),
                client: {
                    name: clientName,
                    email: clientEmail,
                    company: clientCompany
                },
                project: quotationData,
                status: 'draft'
            };

            this.quotations.push(quotation);
            this.saveToLocalStorage();
            this.renderQuotation(quotation);
            this.hideAIStatus();

            this.showNotification('Quotation generated successfully!', 'success');
        } catch (error) {
            this.hideAIStatus();
            this.showNotification('Error generating quotation: ' + error.message, 'error');
        }
    }

    async enhanceDescription() {
        const description = document.getElementById('projectDescription').value.trim();

        if (!description) {
            this.showNotification('Please enter a description first', 'error');
            return;
        }

        if (!this.apiKey) {
            this.showApiKeyModal();
            return;
        }

        this.showAIStatus('AI is enhancing your description...');

        try {
            const prompt = `Enhance and expand this project description to be more professional and detailed. Keep it concise but comprehensive:\n\n${description}`;

            const enhanced = await this.callGeminiAPI(prompt, '', true);
            document.getElementById('projectDescription').value = enhanced;
            this.updateCharCount();
            this.hideAIStatus();

            this.showNotification('Description enhanced!', 'success');
        } catch (error) {
            this.hideAIStatus();
            this.showNotification('Error enhancing description: ' + error.message, 'error');
        }
    }

    async callGeminiAPI(description, budgetRange, enhanceOnly = false) {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`;

        let prompt;
        if (enhanceOnly) {
            prompt = description;
        } else {
            prompt = `You are a professional business consultant. Based on the following project description, create a detailed quotation breakdown.

Project Description:
${description}

Budget Range: ${budgetRange ? '₹' + budgetRange : 'Not specified'}

Please provide a JSON response with the following structure:
{
    "projectName": "Brief project name",
    "summary": "2-3 sentence project summary",
    "deliverables": ["deliverable 1", "deliverable 2", ...],
    "timeline": "Estimated timeline",
    "lineItems": [
        {"description": "Item name", "amount": 0000},
        ...
    ],
    "totalAmount": 0000,
    "terms": ["term 1", "term 2", ...]
}

Make it professional and realistic. Ensure amounts are in INR and reasonable.`;
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error('API request failed. Please check your API key.');
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;

        if (enhanceOnly) {
            return text.trim();
        }

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        } else {
            throw new Error('Invalid response format from AI');
        }
    }

    // ========================================
    // Invoice Management
    // ========================================

    addLineItem() {
        this.lineItemCount++;
        const container = document.getElementById('lineItemsContainer');

        const lineItem = document.createElement('div');
        lineItem.className = 'line-item';
        lineItem.innerHTML = `
            <div class="form-group">
                <label>Description</label>
                <input type="text" class="item-description" placeholder="Item description">
            </div>
            <div class="form-group">
                <label>Quantity</label>
                <input type="number" class="item-quantity" value="1" min="1">
            </div>
            <div class="form-group">
                <label>Rate (₹)</label>
                <input type="number" class="item-rate" placeholder="0.00" step="0.01">
            </div>
            <button class="btn-remove-item" onclick="this.parentElement.remove()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;

        container.appendChild(lineItem);
    }

    generateInvoice() {
        const invoiceNumber = document.getElementById('invoiceNumber').value.trim();
        const invoiceDate = document.getElementById('invoiceDate').value;
        const dueDate = document.getElementById('dueDate').value;
        const clientName = document.getElementById('invoiceClientName').value.trim();
        const clientEmail = document.getElementById('invoiceClientEmail').value.trim();
        const paymentTerms = document.getElementById('paymentTerms').value;
        const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
        const discountRate = parseFloat(document.getElementById('discountRate').value) || 0;

        if (!invoiceNumber || !invoiceDate || !clientName) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const lineItems = this.getLineItems();
        if (lineItems.length === 0) {
            this.showNotification('Please add at least one line item', 'error');
            return;
        }

        const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
        const discountAmount = (subtotal * discountRate) / 100;
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = (taxableAmount * taxRate) / 100;
        const total = taxableAmount + taxAmount;

        const invoice = {
            id: this.generateId(),
            type: 'invoice',
            number: invoiceNumber,
            date: invoiceDate,
            dueDate: dueDate,
            client: {
                name: clientName,
                email: clientEmail
            },
            lineItems: lineItems,
            subtotal: subtotal,
            discount: discountAmount,
            tax: taxAmount,
            total: total,
            paymentTerms: paymentTerms,
            status: 'unpaid'
        };

        this.invoices.push(invoice);
        this.saveToLocalStorage();
        this.renderInvoice(invoice);

        this.showNotification('Invoice generated successfully!', 'success');
    }

    getLineItems() {
        const items = [];
        document.querySelectorAll('.line-item').forEach(item => {
            const description = item.querySelector('.item-description').value.trim();
            const quantity = parseFloat(item.querySelector('.item-quantity').value) || 0;
            const rate = parseFloat(item.querySelector('.item-rate').value) || 0;

            if (description && quantity > 0 && rate > 0) {
                items.push({
                    description,
                    quantity,
                    rate,
                    total: quantity * rate
                });
            }
        });
        return items;
    }

    convertQuotationToInvoice() {
        const select = document.getElementById('quotationSelect');
        const quotationId = select.value;

        if (!quotationId) {
            this.showNotification('Please select a quotation', 'error');
            return;
        }

        const quotation = this.quotations.find(q => q.id === quotationId);
        if (!quotation) return;

        // Populate invoice form
        document.getElementById('invoiceClientName').value = quotation.client.name;
        document.getElementById('invoiceClientEmail').value = quotation.client.email;

        // Clear existing line items
        document.getElementById('lineItemsContainer').innerHTML = '';

        // Add line items from quotation
        if (quotation.project.lineItems) {
            quotation.project.lineItems.forEach(item => {
                this.addLineItem();
                const lastItem = document.querySelector('.line-item:last-child');
                lastItem.querySelector('.item-description').value = item.description;
                lastItem.querySelector('.item-quantity').value = 1;
                lastItem.querySelector('.item-rate').value = item.amount;
            });
        }

        this.showNotification('Quotation converted to invoice!', 'success');
    }

    // ========================================
    // Rendering
    // ========================================

    renderQuotation(quotation) {
        const preview = document.getElementById('quotationPreview');

        const html = `
            <div class="document">
                <div class="doc-header">
                    <div class="company-info">
                        <h1>Your Company Name</h1>
                        <p>Professional Business Solutions</p>
                    </div>
                    <div class="doc-type">
                        <h2>QUOTATION</h2>
                        <p class="doc-number">${quotation.number}</p>
                        <p>${new Date(quotation.date).toLocaleDateString()}</p>
                    </div>
                </div>

                <div class="doc-details">
                    <div class="detail-section">
                        <h3>Client Details</h3>
                        <p><strong>${quotation.client.name}</strong></p>
                        ${quotation.client.company ? `<p>${quotation.client.company}</p>` : ''}
                        ${quotation.client.email ? `<p>${quotation.client.email}</p>` : ''}
                    </div>
                    <div class="detail-section">
                        <h3>Project Details</h3>
                        <p><strong>${quotation.project.projectName}</strong></p>
                        <p>Timeline: ${quotation.project.timeline}</p>
                    </div>
                </div>

                <div class="project-summary">
                    <h3>Project Summary</h3>
                    <p>${quotation.project.summary}</p>
                </div>

                <div class="deliverables">
                    <h3>Deliverables</h3>
                    <ul>
                        ${quotation.project.deliverables.map(d => `<li>${d}</li>`).join('')}
                    </ul>
                </div>

                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${quotation.project.lineItems.map(item => `
                            <tr>
                                <td>${item.description}</td>
                                <td style="text-align: right;">₹${this.formatCurrency(item.amount)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totals-section">
                    <div class="total-row grand-total">
                        <span>Total Amount</span>
                        <span>₹${this.formatCurrency(quotation.project.totalAmount)}</span>
                    </div>
                </div>

                <div class="terms-section">
                    <h3>Terms & Conditions</h3>
                    <ul>
                        ${quotation.project.terms.map(t => `<li>${t}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;

        preview.innerHTML = html;
    }

    renderInvoice(invoice) {
        const preview = document.getElementById('invoicePreview');

        const html = `
            <div class="document">
                <div class="doc-header">
                    <div class="company-info">
                        <h1>Your Company Name</h1>
                        <p>Professional Business Solutions</p>
                    </div>
                    <div class="doc-type">
                        <h2>INVOICE</h2>
                        <p class="doc-number">${invoice.number}</p>
                        <p>Date: ${new Date(invoice.date).toLocaleDateString()}</p>
                        <p>Due: ${new Date(invoice.dueDate).toLocaleDateString()}</p>
                    </div>
                </div>

                <div class="doc-details">
                    <div class="detail-section">
                        <h3>Bill To</h3>
                        <p><strong>${invoice.client.name}</strong></p>
                        ${invoice.client.email ? `<p>${invoice.client.email}</p>` : ''}
                    </div>
                    <div class="detail-section">
                        <h3>Payment Terms</h3>
                        <p>${this.getPaymentTermsText(invoice.paymentTerms)}</p>
                    </div>
                </div>

                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: center;">Quantity</th>
                            <th style="text-align: right;">Rate</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.lineItems.map(item => `
                            <tr>
                                <td>${item.description}</td>
                                <td style="text-align: center;">${item.quantity}</td>
                                <td style="text-align: right;">₹${this.formatCurrency(item.rate)}</td>
                                <td style="text-align: right;">₹${this.formatCurrency(item.total)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totals-section">
                    <div class="total-row">
                        <span>Subtotal</span>
                        <span>₹${this.formatCurrency(invoice.subtotal)}</span>
                    </div>
                    ${invoice.discount > 0 ? `
                        <div class="total-row">
                            <span>Discount</span>
                            <span>- ₹${this.formatCurrency(invoice.discount)}</span>
                        </div>
                    ` : ''}
                    ${invoice.tax > 0 ? `
                        <div class="total-row">
                            <span>Tax</span>
                            <span>₹${this.formatCurrency(invoice.tax)}</span>
                        </div>
                    ` : ''}
                    <div class="total-row grand-total">
                        <span>Total Amount</span>
                        <span>₹${this.formatCurrency(invoice.total)}</span>
                    </div>
                </div>
            </div>
        `;

        preview.innerHTML = html;
    }

    // ========================================
    // History Management
    // ========================================

    loadHistory() {
        const grid = document.getElementById('historyGrid');
        const allDocs = [...this.quotations, ...this.invoices].sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        if (allDocs.length === 0) {
            grid.innerHTML = `
                <div class="history-placeholder">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <h3>No Documents Yet</h3>
                    <p>Your generated quotations and invoices will appear here</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = allDocs.map(doc => `
            <div class="history-card" data-id="${doc.id}" data-type="${doc.type}">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div>
                        <h4 style="font-size: 1.1rem; margin-bottom: 0.25rem;">${doc.number}</h4>
                        <p style="color: var(--text-muted); font-size: 0.875rem;">${new Date(doc.date).toLocaleDateString()}</p>
                    </div>
                    <span class="badge ${doc.type}">${doc.type.toUpperCase()}</span>
                </div>
                <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">
                    <strong>${doc.client.name}</strong>
                </p>
                ${doc.type === 'invoice' ? `
                    <p style="font-size: 1.25rem; font-weight: 700; color: var(--primary-color);">
                        ₹${this.formatCurrency(doc.total)}
                    </p>
                ` : `
                    <p style="font-size: 1.25rem; font-weight: 700; color: var(--primary-color);">
                        ₹${this.formatCurrency(doc.project.totalAmount)}
                    </p>
                `}
            </div>
        `).join('');

        // Add click handlers
        document.querySelectorAll('.history-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                const type = card.dataset.type;
                this.viewDocument(id, type);
            });
        });

        // Update quotation select dropdown
        this.updateQuotationSelect();
    }

    updateQuotationSelect() {
        const select = document.getElementById('quotationSelect');
        if (!select) return;

        select.innerHTML = '<option value="">Select a quotation to convert...</option>' +
            this.quotations.map(q => `
                <option value="${q.id}">${q.number} - ${q.client.name}</option>
            `).join('');
    }

    filterHistory(filter) {
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        // Filter cards
        document.querySelectorAll('.history-card').forEach(card => {
            const type = card.dataset.type;
            if (filter === 'all') {
                card.style.display = 'block';
            } else if (filter === 'quotations' && type === 'quotation') {
                card.style.display = 'block';
            } else if (filter === 'invoices' && type === 'invoice') {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    viewDocument(id, type) {
        const doc = type === 'quotation'
            ? this.quotations.find(q => q.id === id)
            : this.invoices.find(i => i.id === id);

        if (!doc) return;

        if (type === 'quotation') {
            this.switchView('quotation');
            this.renderQuotation(doc);
        } else {
            this.switchView('invoice');
            this.renderInvoice(doc);
        }
    }

    // ========================================
    // PDF Generation
    // ========================================

    downloadPDF(type) {
        const preview = type === 'quotation'
            ? document.getElementById('quotationPreview')
            : document.getElementById('invoicePreview');

        if (!preview.querySelector('.document')) {
            this.showNotification('No document to download', 'error');
            return;
        }

        // Simple print dialog (for now)
        window.print();

        this.showNotification('Opening print dialog...', 'info');
    }

    // ========================================
    // Utility Functions
    // ========================================

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    getPaymentTermsText(terms) {
        const termsMap = {
            'immediate': 'Due on Receipt',
            'net15': 'Net 15 Days',
            'net30': 'Net 30 Days',
            'net60': 'Net 60 Days'
        };
        return termsMap[terms] || terms;
    }

    updateCharCount() {
        const textarea = document.getElementById('projectDescription');
        const counter = document.querySelector('.char-count');
        if (textarea && counter) {
            counter.textContent = `${textarea.value.length} / 1000`;
        }
    }

    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const invoiceDate = document.getElementById('invoiceDate');
        const dueDate = document.getElementById('dueDate');

        if (invoiceDate) invoiceDate.value = today;
        if (dueDate) dueDate.value = nextWeek;
    }

    saveToLocalStorage() {
        localStorage.setItem('quotations', JSON.stringify(this.quotations));
        localStorage.setItem('invoices', JSON.stringify(this.invoices));
    }

    // ========================================
    // API Key Management
    // ========================================

    checkApiKey() {
        if (!this.apiKey) {
            setTimeout(() => this.showApiKeyModal(), 1000);
        }
    }

    showApiKeyModal() {
        document.getElementById('apiKeyModal').classList.add('active');
    }

    closeModal() {
        document.getElementById('apiKeyModal').classList.remove('active');
    }

    saveApiKey() {
        const apiKey = document.getElementById('apiKeyInput').value.trim();
        if (apiKey) {
            this.apiKey = apiKey;
            localStorage.setItem('gemini_api_key', apiKey);
            this.closeModal();
            this.showNotification('API key saved successfully!', 'success');
        } else {
            this.showNotification('Please enter a valid API key', 'error');
        }
    }

    // ========================================
    // UI Feedback
    // ========================================

    showAIStatus(message) {
        const status = document.getElementById('aiStatus');
        if (status) {
            status.querySelector('.status-text').textContent = message;
            status.style.display = 'flex';
        }
    }

    hideAIStatus() {
        const status = document.getElementById('aiStatus');
        if (status) {
            status.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#4facfe' : type === 'error' ? '#f5576c' : '#667eea'};
            color: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 400px;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new AIBusinessAutomation();
});

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .badge {
        padding: 0.25rem 0.75rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
    }

    .badge.quotation {
        background: rgba(102, 126, 234, 0.2);
        color: #667eea;
    }

    .badge.invoice {
        background: rgba(240, 147, 251, 0.2);
        color: #f093fb;
    }
`;
document.head.appendChild(style);
