import express from 'express';
import {
    getAllPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment
} from '../controllers/payment.controller.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/payments - Get all payments
router.get('/', getAllPayments);

// GET /api/payments/:id - Get payment by ID
router.get('/:id', getPaymentById);

// POST /api/payments - Create new payment
router.post('/', requirePermission('write'), createPayment);

// PUT /api/payments/:id - Update payment
router.put('/:id', requirePermission('write'), updatePayment);

// DELETE /api/payments/:id - Delete payment
router.delete('/:id', requirePermission('delete'), deletePayment);

export default router;


