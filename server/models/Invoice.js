import mongoose from 'mongoose';

const InvoiceItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
    },
    total: {
        type: Number,
        required: true,
        min: 0,
    },
});

const InvoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    customer: {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
    },
    items: [InvoiceItemSchema],
    subtotal: {
        type: Number,
        required: true,
        min: 0,
    },
    tax: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    discount: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    total: {
        type: Number,
        required: true,
        min: 0,
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi', 'bank_transfer'],
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'partial', 'refunded'],
        default: 'pending',
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    notes: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});

// Indexes (invoiceNumber already has unique index)
InvoiceSchema.index({ 'customer.name': 1 });
InvoiceSchema.index({ branch: 1 });
InvoiceSchema.index({ createdBy: 1 });
InvoiceSchema.index({ paymentStatus: 1 });
InvoiceSchema.index({ createdAt: -1 });

const Invoice = mongoose.model('Invoice', InvoiceSchema);

export default Invoice;
