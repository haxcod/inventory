import express from 'express';
import {
    getAllBranches,
    getBranchById,
    createBranch,
    updateBranch,
    deleteBranch,
    searchBranches
} from '../controllers/branch.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/branches - Get all branches (admin only)
router.get('/', requirePermission('branches.view'), getAllBranches);

// GET /api/branches/search - Search branches (admin only)
router.get('/search', requirePermission('branches.view'), searchBranches);

// GET /api/branches/:id - Get branch by ID (admin only)
router.get('/:id', requirePermission('branches.view'), getBranchById);

// POST /api/branches - Create new branch (admin only)
router.post('/', requirePermission('branches.create'), createBranch);

// PUT /api/branches/:id - Update branch (admin only)
router.put('/:id', requirePermission('branches.edit'), updateBranch);

// DELETE /api/branches/:id - Delete branch (admin only)
router.delete('/:id', requirePermission('branches.delete'), deleteBranch);

export default router;


