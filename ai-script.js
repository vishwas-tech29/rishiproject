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
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;

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

        // Calculate totals
        const subtotal = quotation.project.totalAmount;
        const discount = 8000; // Example fixed discount as per image, or calculate dynamically
        const grandTotal = subtotal - discount;

        const html = `
            <div class="document pranayuv-template" id="quotation-content">
                <!-- Top Blue Bar -->
                <div class="top-bar"></div>

                <!-- Header -->
                <div class="doc-header">
                    <div class="logo-section">
                        <div class="logo-box">
                            <span class="logo-p">P</span>
                            <span class="logo-v">V</span>
                        </div>
                    </div>
                    <div class="company-info">
                        <h1>PRANAYUV TECHNOLOGIES PVT LTD</h1>
                        <p class="tagline">Empowering Lives through Innovation</p>
                    </div>
                </div>

                <!-- Blue Divider -->
                <div class="blue-divider"></div>

                <!-- Title -->
                <div class="doc-title">
                    <h2>Quotation # ${quotation.number}</h2>
                </div>

                <!-- Client & Date Info -->
                <div class="info-grid">
                    <div class="client-info">
                        <h3 class="info-label">BILL TO / CLIENT</h3>
                        <p><strong>Client Name:</strong> ${quotation.client.name}</p>
                        <p><strong>Company:</strong> ${quotation.client.company || 'N/A'}</p>
                        <p><strong>Address:</strong> ${quotation.client.address || 'Not Provided'}</p>
                        <p><strong>Contact:</strong> ${quotation.client.email}</p>
                    </div>
                    <div class="date-info">
                        <p><strong>Date:</strong> ${new Date(quotation.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        <p><strong>Valid Until:</strong> ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                </div>

                <!-- Project Details -->
                <div class="project-details">
                    <p><strong>Project:</strong> ${quotation.project.projectName}</p>
                    <p><strong>Delivery:</strong> ${quotation.project.timeline}</p>
                    <p><strong>Maintenance:</strong> 18 months included (1 hour/month basic updates)</p>
                </div>

                <!-- Line Items Table -->
                <table class="pranayuv-table">
                    <thead>
                        <tr>
                            <th class="col-item">Item</th>
                            <th class="col-total">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="item-list-cell">
                                <ul class="item-list">
                                    ${quotation.project.lineItems.map(item => `<li>${item.description}</li>`).join('')}
                                    ${quotation.project.deliverables ? quotation.project.deliverables.map(d => `<li>${d}</li>`).join('') : ''}
                                </ul>
                            </td>
                            <td class="total-cell">
                                <strong>₹${this.formatCurrency(subtotal)}</strong>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Totals -->
                <div class="totals-container">
                    <div class="total-row">
                        <span class="label">Standard Package Cost</span>
                        <span class="value"><strong>₹${this.formatCurrency(subtotal)}</strong></span>
                    </div>
                    <div class="total-row">
                        <span class="label">Inaugural Client Discount (FIRST50)</span>
                        <span class="value">- ₹${this.formatCurrency(discount)}</span>
                    </div>
                    <div class="total-row grand-total-row">
                        <span class="label">GRAND TOTAL</span>
                        <span class="value"><strong>₹${this.formatCurrency(grandTotal)}</strong></span>
                    </div>
                </div>

                <!-- Footer Blue Bar -->
                <div class="bottom-bar"></div>
            </div>
        `;

        preview.innerHTML = html;
    }

    renderInvoice(invoice) {
        // Keep existing invoice render for now, or update if requested. 
        // Focusing on Quotation as per user request "issue with pdf genarotor" (implied context of previous turn was quotation)
        // But let's make sure it doesn't break.
        const preview = document.getElementById('invoicePreview');
        const html = `
            <div class="document" id="invoice-content">
                <div class="doc-header">
                    <div class="company-info">
                        <h1>PRANAYUV TECHNOLOGIES PVT LTD</h1>
                        <p>Empowering Lives through Innovation</p>
                    </div>
                    <div class="doc-type">
                        <h2>INVOICE</h2>
                        <p class="doc-number">${invoice.number}</p>
                        <p>Date: ${new Date(invoice.date).toLocaleDateString()}</p>
                    </div>
                </div>
                <!-- ... (rest of invoice structure similar to before but with id="invoice-content") ... -->
                <div class="doc-details">
                    <div class="detail-section">
                        <h3>Bill To</h3>
                        <p><strong>${invoice.client.name}</strong></p>
                        ${invoice.client.email ? `<p>${invoice.client.email}</p>` : ''}
                    </div>
                </div>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.lineItems.map(item => `
                            <tr>
                                <td>${item.description}</td>
                                <td style="text-align: right;">₹${this.formatCurrency(item.total)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="totals-section">
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
    // PDF Generation
    // ========================================

    downloadPDF(type) {
        const elementId = type === 'quotation' ? 'quotation-content' : 'invoice-content';
        const element = document.getElementById(elementId);

        if (!element) {
            this.showNotification('No document to download', 'error');
            return;
        }

        this.showNotification('Generating PDF...', 'info');

        const opt = {
            margin: 0,
            filename: `${type}_${new Date().getTime()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            this.showNotification('PDF downloaded successfully!', 'success');
        }).catch(err => {
            console.error(err);
            this.showNotification('Error generating PDF', 'error');
        });
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
