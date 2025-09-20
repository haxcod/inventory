import express from 'express';
import {
    createTransfer,
    getAllTransfers,
    getTransferById,
    cancelTransfer,
    getTransferStats
} from '../controllers/transfer.controller.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/transfers - Get all transfers
router.get('/', getAllTransfers);

// GET /api/transfers/stats - Get transfer statistics
router.get('/stats', getTransferStats);

// GET /api/transfers/:id - Get transfer by ID
router.get('/:id', getTransferById);

// POST /api/transfers - Create new transfer
router.post('/', requirePermission('transfer_products'), createTransfer);

// PUT /api/transfers/:id/cancel - Cancel a transfer
router.put('/:id/cancel', requirePermission('transfer_products'), cancelTransfer);

export default router;
