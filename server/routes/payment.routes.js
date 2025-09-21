import express from 'express';
import {
    getAllPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment
} from '../controllers/payment.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/payments - Get all payments (users can view)
router.get('/', requirePermission('payments.view'), getAllPayments);

// GET /api/payments/:id - Get payment by ID (users can view)
router.get('/:id', requirePermission('payments.view'), getPaymentById);

// POST /api/payments - Create new payment (users can create)
router.post('/', requirePermission('payments.create'), createPayment);

// PUT /api/payments/:id - Update payment (admin only)
router.put('/:id', requirePermission('payments.edit'), updatePayment);

// DELETE /api/payments/:id - Delete payment (admin only)
router.delete('/:id', requirePermission('payments.delete'), deletePayment);

export default router;


