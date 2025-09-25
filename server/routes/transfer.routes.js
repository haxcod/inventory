import express from 'express';
import {
    createTransfer,
    getAllTransfers,
    getTransferById,
    cancelTransfer,
    getTransferStats
} from '../controllers/transfer.controller.js';
import { authenticateToken, filterByBranch } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Apply branch filtering
router.use(filterByBranch);

// GET /api/transfers - Get all transfers (users can view)
router.get('/', requirePermission('transfers.view'), getAllTransfers);

// GET /api/transfers/stats - Get transfer statistics (users can view)
router.get('/stats', requirePermission('transfers.view'), getTransferStats);

// GET /api/transfers/:id - Get transfer by ID (users can view)
router.get('/:id', requirePermission('transfers.view'), getTransferById);

// POST /api/transfers - Create new transfer (users can create)
router.post('/', requirePermission('transfers.create'), createTransfer);

// PUT /api/transfers/:id/cancel - Cancel a transfer (users can cancel)
router.put('/:id/cancel', requirePermission('transfers.edit'), cancelTransfer);

export default router;
