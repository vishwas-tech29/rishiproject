const Invoice = require('../models/Invoice');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
exports.getAllInvoices = async (req, res) => {
    try {
        const { status, page = 1, limit = 10, sortBy = '-createdAt' } = req.query;

        const query = { createdBy: req.user.id };
        if (status) query['invoice.status'] = status;

        const invoices = await Invoice.find(query)
            .sort(sortBy)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Invoice.countDocuments(query);

        res.json({
            success: true,
            data: invoices,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            data: invoice
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private
exports.createInvoice = async (req, res) => {
    try {
        const invoiceData = {
            ...req.body,
            createdBy: req.user.id
        };

        const invoice = await Invoice.create(invoiceData);

        res.status(201).json({
            success: true,
            data: invoice,
            message: 'Invoice created successfully'
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Invoice number already exists'
            });
        }

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
exports.updateInvoice = async (req, res) => {
    try {
        let invoice = await Invoice.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        invoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.json({
            success: true,
            data: invoice,
            message: 'Invoice updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
exports.deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        await invoice.deleteOne();

        res.json({
            success: true,
            message: 'Invoice deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update invoice status
// @route   PATCH /api/invoices/:id/status
// @access  Private
exports.updateInvoiceStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['draft', 'sent', 'paid', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const invoice = await Invoice.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        invoice.invoice.status = status;
        await invoice.save();

        res.json({
            success: true,
            data: invoice,
            message: `Invoice marked as ${status}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get invoice statistics
// @route   GET /api/invoices/stats
// @access  Private
exports.getInvoiceStats = async (req, res) => {
    try {
        const stats = await Invoice.aggregate([
            { $match: { createdBy: req.user._id } },
            {
                $group: {
                    _id: '$invoice.status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$pricing.grandTotal' }
                }
            }
        ]);

        const totalInvoices = await Invoice.countDocuments({ createdBy: req.user.id });
        const totalRevenue = await Invoice.aggregate([
            { $match: { createdBy: req.user._id, 'invoice.status': 'paid' } },
            { $group: { _id: null, total: { $sum: '$pricing.grandTotal' } } }
        ]);

        res.json({
            success: true,
            data: {
                statusBreakdown: stats,
                totalInvoices,
                totalRevenue: totalRevenue[0]?.total || 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Search invoices
// @route   GET /api/invoices/search/:query
// @access  Private
exports.searchInvoices = async (req, res) => {
    try {
        const { query } = req.params;

        const invoices = await Invoice.find({
            createdBy: req.user.id,
            $or: [
                { 'invoice.number': { $regex: query, $options: 'i' } },
                { 'client.name': { $regex: query, $options: 'i' } },
                { 'client.company': { $regex: query, $options: 'i' } },
                { 'project.name': { $regex: query, $options: 'i' } }
            ]
        }).limit(20);

        res.json({
            success: true,
            data: invoices,
            count: invoices.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get public invoice (no auth required)
// @route   GET /api/invoices/public/:id
// @access  Public
exports.getPublicInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            data: invoice
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
