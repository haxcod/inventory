import Transfer from '../models/Transfer.js';
import Product from '../models/Product.js';
import Branch from '../models/Branch.js';
import StockMovement from '../models/StockMovement.js';

// Create a new transfer
export const createTransfer = async (transferData) => {
    try {
        const { productId, fromBranch, toBranch, quantity, reason, notes, createdBy } = transferData;

        // Validate that product exists
        const product = await Product.findById(productId).populate('branch');
        if (!product) {
            throw new Error('Product not found');
        }

        // Validate that branches exist
        const [fromBranchData, toBranchData] = await Promise.all([
            Branch.findById(fromBranch),
            Branch.findById(toBranch)
        ]);

        if (!fromBranchData) {
            throw new Error('Source branch not found');
        }
        if (!toBranchData) {
            throw new Error('Destination branch not found');
        }

        // Validate that product is in the source branch
        const productBranchId = typeof product.branch === 'object' ? product.branch._id.toString() : product.branch.toString();
        if (productBranchId !== fromBranch) {
            throw new Error('Product is not in the specified source branch');
        }

        // Validate sufficient stock
        if (product.stock < quantity) {
            throw new Error(`Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`);
        }

        // Validate different branches
        if (fromBranch === toBranch) {
            throw new Error('Source and destination branches cannot be the same');
        }

        // Create the transfer record
        const transfer = new Transfer({
            product: productId,
            fromBranch,
            toBranch,
            quantity,
            reason,
            notes,
            createdBy,
            status: 'pending'
        });

        await transfer.save();

        // Update product stock and branch
        product.stock -= quantity;
        product.branch = toBranch;
        await product.save();

        // Create stock movement records
        const stockMovements = [
            {
                product: productId,
                branch: fromBranch,
                type: 'out',
                quantity,
                reason: `Transfer to ${toBranchData.name}: ${reason}`,
                reference: transfer._id,
                createdBy
            },
            {
                product: productId,
                branch: toBranch,
                type: 'in',
                quantity,
                reason: `Transfer from ${fromBranchData.name}: ${reason}`,
                reference: transfer._id,
                createdBy
            }
        ];

        await StockMovement.insertMany(stockMovements);

        // Update transfer status to completed
        transfer.status = 'completed';
        transfer.completedAt = new Date();
        transfer.completedBy = createdBy;
        await transfer.save();

        // Populate the transfer with related data
        const populatedTransfer = await Transfer.findById(transfer._id)
            .populate('product', 'name sku unit price')
            .populate('fromBranch', 'name address')
            .populate('toBranch', 'name address')
            .populate('createdBy', 'name email')
            .populate('completedBy', 'name email');

        return populatedTransfer;
    } catch (error) {
        throw error;
    }
};

// Get all transfers with pagination and filters
export const getAllTransfers = async (filters = {}, page = 1, limit = 10) => {
    try {
        const query = {};

        // Apply filters
        if (filters.productId) {
            query.product = filters.productId;
        }
        if (filters.branch) {
            query.$or = [
                { fromBranch: filters.branch },
                { toBranch: filters.branch }
            ];
        }
        if (filters.status) {
            query.status = filters.status;
        }
        if (filters.reason) {
            query.reason = { $regex: filters.reason, $options: 'i' };
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Execute query with population
        const [transfers, total] = await Promise.all([
            Transfer.find(query)
                .populate('product', 'name sku unit price')
                .populate('fromBranch', 'name address')
                .populate('toBranch', 'name address')
                .populate('createdBy', 'name email')
                .populate('completedBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Transfer.countDocuments(query)
        ]);

        return {
            transfers,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total,
                limit
            }
        };
    } catch (error) {
        throw error;
    }
};

// Get transfer by ID
export const getTransferById = async (id) => {
    try {
        const transfer = await Transfer.findById(id)
            .populate('product', 'name sku unit price')
            .populate('fromBranch', 'name address')
            .populate('toBranch', 'name address')
            .populate('createdBy', 'name email')
            .populate('completedBy', 'name email');

        if (!transfer) {
            throw new Error('Transfer not found');
        }

        return transfer;
    } catch (error) {
        throw error;
    }
};

// Cancel a transfer (if still pending)
export const cancelTransfer = async (id, userId) => {
    try {
        const transfer = await Transfer.findById(id);
        if (!transfer) {
            throw new Error('Transfer not found');
        }

        if (transfer.status !== 'pending') {
            throw new Error('Only pending transfers can be cancelled');
        }

        transfer.status = 'cancelled';
        transfer.completedAt = new Date();
        transfer.completedBy = userId;
        await transfer.save();

        return transfer;
    } catch (error) {
        throw error;
    }
};

// Get transfer statistics
export const getTransferStats = async (filters = {}) => {
    try {
        const query = {};
        
        if (filters.branch) {
            query.$or = [
                { fromBranch: filters.branch },
                { toBranch: filters.branch }
            ];
        }

        const stats = await Transfer.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalTransfers: { $sum: 1 },
                    completedTransfers: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    pendingTransfers: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    cancelledTransfers: {
                        $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                    },
                    totalQuantity: { $sum: '$quantity' }
                }
            }
        ]);

        return stats[0] || {
            totalTransfers: 0,
            completedTransfers: 0,
            pendingTransfers: 0,
            cancelledTransfers: 0,
            totalQuantity: 0
        };
    } catch (error) {
        throw error;
    }
};
