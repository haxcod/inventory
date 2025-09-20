import * as transferService from '../services/transfer.service.js';

// Create a new transfer
export const createTransfer = async (req, res) => {
    try {
        const transferData = {
            ...req.body,
            createdBy: req.user._id
        };

        const transfer = await transferService.createTransfer(transferData);
        
        res.status(201).json({
            success: true,
            message: 'Transfer created successfully',
            data: { transfer }
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 
                          error.message.includes('Insufficient') ? 400 :
                          error.message.includes('cannot be the same') ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// Get all transfers
export const getAllTransfers = async (req, res) => {
    try {
        const { page = 1, limit = 10, productId, branch, status, reason } = req.query;
        
        const filters = {};
        if (productId) filters.productId = productId;
        if (branch) filters.branch = branch;
        if (status) filters.status = status;
        if (reason) filters.reason = reason;

        const result = await transferService.getAllTransfers(filters, parseInt(page), parseInt(limit));
        
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

// Get transfer by ID
export const getTransferById = async (req, res) => {
    try {
        const { id } = req.params;
        const transfer = await transferService.getTransferById(id);
        
        res.json({
            success: true,
            data: { transfer }
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// Cancel a transfer
export const cancelTransfer = async (req, res) => {
    try {
        const { id } = req.params;
        const transfer = await transferService.cancelTransfer(id, req.user._id);
        
        res.json({
            success: true,
            message: 'Transfer cancelled successfully',
            data: { transfer }
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 
                          error.message.includes('Only pending') ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// Get transfer statistics
export const getTransferStats = async (req, res) => {
    try {
        const { branch } = req.query;
        
        const filters = {};
        if (branch) filters.branch = branch;

        const stats = await transferService.getTransferStats(filters);
        
        res.json({
            success: true,
            data: { stats }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
