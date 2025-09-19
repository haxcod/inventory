import * as paymentService from '../services/payment.service.js';

// Get all payments
export const getAllPayments = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            branch, 
            paymentMethod, 
            paymentType, 
            customer, 
            dateFrom, 
            dateTo 
        } = req.query;
        
        const filters = {};
        if (branch) filters.branch = branch;
        if (paymentMethod) filters.paymentMethod = paymentMethod;
        if (paymentType) filters.paymentType = paymentType;
        if (customer) filters.customer = customer;
        if (dateFrom) filters.dateFrom = dateFrom;
        if (dateTo) filters.dateTo = dateTo;

        const result = await paymentService.getAllPayments(filters, parseInt(page), parseInt(limit));
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get payment by ID
export const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await paymentService.getPaymentById(id);
        
        res.json({
            success: true,
            data: { payment }
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// Create new payment
export const createPayment = async (req, res) => {
    try {
        const payment = await paymentService.createPayment(req.body, req.user._id);
        
        res.status(201).json({
            success: true,
            message: 'Payment created successfully',
            data: { payment }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update payment
export const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await paymentService.updatePayment(id, req.body);
        
        res.json({
            success: true,
            message: 'Payment updated successfully',
            data: { payment }
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// Delete payment
export const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await paymentService.deletePayment(id);
        
        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};


