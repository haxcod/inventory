import * as billingService from '../services/billing.service.js';

// Get all invoices
export const getAllInvoices = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            branch, 
            paymentStatus, 
            customer, 
            dateFrom, 
            dateTo 
        } = req.query;
        
        const filters = {};
        if (branch) filters.branch = branch;
        if (paymentStatus) filters.paymentStatus = paymentStatus;
        if (customer) filters.customer = customer;
        if (dateFrom) filters.dateFrom = dateFrom;
        if (dateTo) filters.dateTo = dateTo;

        const result = await billingService.getAllInvoices(filters, parseInt(page), parseInt(limit));
        
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

// Get invoice by ID
export const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await billingService.getInvoiceById(id);
        
        res.json({
            success: true,
            data: { invoice }
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// Create new invoice
export const createInvoice = async (req, res) => {
    try {
        const invoice = await billingService.createInvoice(req.body, req.user._id);
        
        res.status(201).json({
            success: true,
            message: 'Invoice created successfully',
            data: { invoice }
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') || 
                          error.message.includes('Insufficient stock') ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// Update invoice
export const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await billingService.updateInvoice(id, req.body);
        
        res.json({
            success: true,
            message: 'Invoice updated successfully',
            data: { invoice }
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// Delete invoice
export const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await billingService.deleteInvoice(id);
        
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

// Generate invoice PDF
export const generateInvoicePDF = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await billingService.generateInvoicePDF(id);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// QR Code scan for product
export const qrCodeScan = async (req, res) => {
    try {
        const { qrCode } = req.body;
        
        if (!qrCode) {
            return res.status(400).json({
                success: false,
                message: 'QR code is required'
            });
        }

        // Find product by QR code
        const product = await Product.findOne({ qrCode }).populate('branch', 'name address');
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found for this QR code'
            });
        }

        res.json({
            success: true,
            data: { product }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


