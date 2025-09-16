import express from 'express';
import {
    getSalesReport,
    getStockReport,
    getPaymentReport
} from '../controllers/report.controller.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/reports/sales - Get sales report
router.get('/sales', getSalesReport);

// GET /api/reports/stock - Get stock report
router.get('/stock', getStockReport);

// GET /api/reports/payments - Get payment report
router.get('/payments', getPaymentReport);

export default router;

