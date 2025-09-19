import Payment from '../models/Payment.js';

// Get all payments
export const getAllPayments = async (filters = {}, page = 1, limit = 10) => {
    try {
        const query = {};
        
        // Apply filters
        if (filters.branch) query.branch = filters.branch;
        if (filters.paymentMethod) query.paymentMethod = filters.paymentMethod;
        if (filters.paymentType) query.paymentType = filters.paymentType;
        if (filters.customer) {
            query.customer = new RegExp(filters.customer, 'i');
        }
        if (filters.dateFrom || filters.dateTo) {
            query.createdAt = {};
            if (filters.dateFrom) {
                query.createdAt.$gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                query.createdAt.$lte = new Date(filters.dateTo);
            }
        }

        const skip = (page - 1) * limit;
        
        const payments = await Payment.find(query)
            .populate('branch', 'name address')
            .populate('createdBy', 'name email')
            .populate('invoice', 'invoiceNumber customer')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Payment.countDocuments(query);

        return {
            payments,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total,
                limit
            }
        };
    } catch (error) {
        throw new Error(`Failed to get payments: ${error.message}`);
    }
};

// Get payment by ID
export const getPaymentById = async (paymentId) => {
    try {
        const payment = await Payment.findById(paymentId)
            .populate('branch', 'name address')
            .populate('createdBy', 'name email')
            .populate('invoice', 'invoiceNumber customer');
        
        if (!payment) {
            throw new Error('Payment not found');
        }
        
        return payment;
    } catch (error) {
        throw new Error(`Failed to get payment: ${error.message}`);
    }
};

// Create new payment
export const createPayment = async (paymentData, userId) => {
    try {
        const payment = await Payment.create({
            ...paymentData,
            createdBy: userId
        });
        
        return await getPaymentById(payment._id);
    } catch (error) {
        throw new Error(`Failed to create payment: ${error.message}`);
    }
};

// Update payment
export const updatePayment = async (paymentId, updateData) => {
    try {
        const payment = await Payment.findByIdAndUpdate(
            paymentId,
            updateData,
            { new: true, runValidators: true }
        ).populate('branch', 'name address')
         .populate('createdBy', 'name email')
         .populate('invoice', 'invoiceNumber customer');

        if (!payment) {
            throw new Error('Payment not found');
        }

        return payment;
    } catch (error) {
        throw new Error(`Failed to update payment: ${error.message}`);
    }
};

// Delete payment
export const deletePayment = async (paymentId) => {
    try {
        const payment = await Payment.findByIdAndDelete(paymentId);
        
        if (!payment) {
            throw new Error('Payment not found');
        }

        return { message: 'Payment deleted successfully' };
    } catch (error) {
        throw new Error(`Failed to delete payment: ${error.message}`);
    }
};


