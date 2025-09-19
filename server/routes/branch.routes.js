import express from 'express';
import {
    getAllBranches,
    getBranchById,
    createBranch,
    updateBranch,
    deleteBranch,
    searchBranches
} from '../controllers/branch.controller.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/branches - Get all branches
router.get('/', getAllBranches);

// GET /api/branches/search - Search branches
router.get('/search', searchBranches);

// GET /api/branches/:id - Get branch by ID
router.get('/:id', getBranchById);

// POST /api/branches - Create new branch
router.post('/', requirePermission('write'), createBranch);

// PUT /api/branches/:id - Update branch
router.put('/:id', requirePermission('write'), updateBranch);

// DELETE /api/branches/:id - Delete branch
router.delete('/:id', requirePermission('delete'), deleteBranch);

export default router;


