import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
    invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi', 'bank_transfer'],
        required: true,
    },
    paymentType: {
        type: String,
        enum: ['credit', 'debit'],
        required: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    reference: {
        type: String,
        trim: true,
    },
    customer: {
        type: String,
        trim: true,
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

// Indexes
PaymentSchema.index({ invoice: 1 });
PaymentSchema.index({ branch: 1 });
PaymentSchema.index({ createdBy: 1 });
PaymentSchema.index({ paymentMethod: 1 });
PaymentSchema.index({ paymentType: 1 });
PaymentSchema.index({ createdAt: -1 });

const Payment = mongoose.model('Payment', PaymentSchema);

export default Payment;


