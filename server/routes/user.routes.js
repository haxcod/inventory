import express from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    searchUsers
} from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/users - Get all users (admin only)
router.get('/', requirePermission('users.view'), getAllUsers);

// GET /api/users/search - Search users (admin only)
router.get('/search', requirePermission('users.view'), searchUsers);

// GET /api/users/:id - Get user by ID (admin only)
router.get('/:id', requirePermission('users.view'), getUserById);

// POST /api/users - Create new user (admin only)
router.post('/', requirePermission('users.create'), createUser);

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', requirePermission('users.edit'), updateUser);

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', requirePermission('users.delete'), deleteUser);

export default router;