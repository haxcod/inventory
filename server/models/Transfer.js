import mongoose from 'mongoose';

const TransferSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    fromBranch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true,
    },
    toBranch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    reason: {
        type: String,
        required: true,
        trim: true,
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    completedAt: {
        type: Date,
    },
    completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});

// Indexes for better query performance
TransferSchema.index({ product: 1 });
TransferSchema.index({ fromBranch: 1 });
TransferSchema.index({ toBranch: 1 });
TransferSchema.index({ status: 1 });
TransferSchema.index({ createdBy: 1 });
TransferSchema.index({ createdAt: -1 });

// Virtual for transfer reference number
TransferSchema.virtual('referenceNumber').get(function() {
    return `TRF-${this._id.toString().slice(-8).toUpperCase()}`;
});

// Ensure virtual fields are serialized
TransferSchema.set('toJSON', { virtuals: true });

const Transfer = mongoose.model('Transfer', TransferSchema);

export default Transfer;
