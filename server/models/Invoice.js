const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
    // Company Details
    company: {
        name: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true
        },
        tagline: {
            type: String,
            trim: true
        },
        logo: {
            type: String,
            trim: true,
            maxlength: 3
        }
    },

    // Invoice Details
    invoice: {
        number: {
            type: String,
            required: [true, 'Invoice number is required'],
            unique: true,
            trim: true
        },
        date: {
            type: Date,
            required: [true, 'Invoice date is required'],
            default: Date.now
        },
        validUntil: {
            type: Date,
            required: [true, 'Valid until date is required']
        },
        status: {
            type: String,
            enum: ['draft', 'sent', 'paid', 'cancelled'],
            default: 'draft'
        }
    },

    // Client Details
    client: {
        name: {
            type: String,
            required: [true, 'Client name is required'],
            trim: true
        },
        company: {
            type: String,
            trim: true
        },
        address: {
            type: String,
            trim: true
        },
        contact: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        }
    },

    // Project Details
    project: {
        name: {
            type: String,
            required: [true, 'Project name is required'],
            trim: true
        },
        delivery: {
            type: String,
            trim: true
        },
        maintenance: {
            type: String,
            trim: true
        }
    },

    // Line Items
    items: {
        type: [lineItemSchema],
        required: [true, 'At least one line item is required'],
        validate: {
            validator: function (items) {
                return items && items.length > 0;
            },
            message: 'Invoice must have at least one line item'
        }
    },

    // Pricing
    pricing: {
        packageCost: {
            type: Number,
            required: [true, 'Package cost is required'],
            min: 0
        },
        discountName: {
            type: String,
            trim: true
        },
        discountAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        grandTotal: {
            type: Number,
            required: true,
            min: 0
        }
    },

    // Metadata
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    notes: {
        type: String,
        trim: true
    },

    tags: [{
        type: String,
        trim: true
    }]

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
invoiceSchema.index({ 'invoice.number': 1 });
invoiceSchema.index({ 'invoice.date': -1 });
invoiceSchema.index({ 'invoice.status': 1 });
invoiceSchema.index({ 'client.name': 1 });
invoiceSchema.index({ createdBy: 1 });

// Virtual for invoice age in days
invoiceSchema.virtual('ageInDays').get(function () {
    return Math.floor((Date.now() - this.invoice.date) / (1000 * 60 * 60 * 24));
});

// Virtual for checking if invoice is expired
invoiceSchema.virtual('isExpired').get(function () {
    return this.invoice.validUntil < Date.now();
});

// Pre-save middleware to calculate grand total
invoiceSchema.pre('save', function (next) {
    this.pricing.grandTotal = this.pricing.packageCost - this.pricing.discountAmount;
    next();
});

// Static method to get invoice statistics
invoiceSchema.statics.getStatistics = async function (userId) {
    const stats = await this.aggregate([
        ...(userId ? [{ $match: { createdBy: mongoose.Types.ObjectId(userId) } }] : []),
        {
            $group: {
                _id: '$invoice.status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$pricing.grandTotal' }
            }
        }
    ]);

    return stats;
};

// Instance method to mark as sent
invoiceSchema.methods.markAsSent = function () {
    this.invoice.status = 'sent';
    return this.save();
};

// Instance method to mark as paid
invoiceSchema.methods.markAsPaid = function () {
    this.invoice.status = 'paid';
    return this.save();
};

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
