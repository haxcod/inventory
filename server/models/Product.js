import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    sku: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    barcode: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
    },
    qrCode: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    brand: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    costPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    minStock: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    maxStock: {
        type: Number,
        required: true,
        min: 0,
        default: 1000,
    },
    unit: {
        type: String,
        required: true,
        trim: true,
        default: 'piece',
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true,
    },
    batchNumber: {
        type: String,
        trim: true,
    },
    warranty: {
        type: String,
        trim: true,
    },
    manufacturingDate: {
        type: Date,
    },
    expiryDate: {
        type: Date,
    },
    image: {
        type: String,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Indexes for better performance (sku and barcode already have unique indexes)
ProductSchema.index({ category: 1 });
ProductSchema.index({ branch: 1 });
ProductSchema.index({ isActive: 1 });

const Product = mongoose.model('Product', ProductSchema);

export default Product;
