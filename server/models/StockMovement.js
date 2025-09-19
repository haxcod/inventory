import mongoose from 'mongoose';

const StockMovementSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true,
    },
    type: {
        type: String,
        enum: ['in', 'out', 'transfer'],
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
    reference: {
        type: String,
        trim: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

// Indexes
StockMovementSchema.index({ product: 1 });
StockMovementSchema.index({ branch: 1 });
StockMovementSchema.index({ type: 1 });
StockMovementSchema.index({ createdBy: 1 });
StockMovementSchema.index({ createdAt: -1 });

const StockMovement = mongoose.model('StockMovement', StockMovementSchema);

export default StockMovement;


