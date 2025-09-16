import * as reportService from '../services/report.service.js';

// Get sales report
export const getSalesReport = async (req, res) => {
    try {
        const { dateFrom, dateTo, branch } = req.query;
        
        const filters = {};
        if (dateFrom) filters.dateFrom = dateFrom;
        if (dateTo) filters.dateTo = dateTo;
        if (branch) filters.branch = branch;

        const report = await reportService.getSalesReport(filters);
        
        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get stock report
export const getStockReport = async (req, res) => {
    try {
        const { branch, category } = req.query;
        
        const filters = {};
        if (branch) filters.branch = branch;
        if (category) filters.category = category;

        const report = await reportService.getStockReport(filters);
        
        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get payment report
export const getPaymentReport = async (req, res) => {
    try {
        const { dateFrom, dateTo, branch } = req.query;
        
        const filters = {};
        if (dateFrom) filters.dateFrom = dateFrom;
        if (dateTo) filters.dateTo = dateTo;
        if (branch) filters.branch = branch;

        const report = await reportService.getPaymentReport(filters);
        
        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

