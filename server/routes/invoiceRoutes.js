const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/public/:id', invoiceController.getPublicInvoice);

// Protected routes (authentication required)
router.use(protect); // All routes below require authentication

// GET /api/invoices - Get all invoices
router.get('/', invoiceController.getAllInvoices);

// GET /api/invoices/stats - Get invoice statistics
router.get('/stats', invoiceController.getInvoiceStats);

// POST /api/invoices - Create new invoice
router.post('/', invoiceController.createInvoice);

// GET /api/invoices/:id - Get single invoice
router.get('/:id', invoiceController.getInvoiceById);

// PUT /api/invoices/:id - Update invoice
router.put('/:id', invoiceController.updateInvoice);

// DELETE /api/invoices/:id - Delete invoice
router.delete('/:id', invoiceController.deleteInvoice);

// PATCH /api/invoices/:id/status - Update invoice status
router.patch('/:id/status', invoiceController.updateInvoiceStatus);

// GET /api/invoices/search/:query - Search invoices
router.get('/search/:query', invoiceController.searchInvoices);

module.exports = router;
