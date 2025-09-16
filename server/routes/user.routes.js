import express from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    searchUsers
} from '../controllers/user.controller.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/users - Get all users
router.get('/', getAllUsers);

// GET /api/users/search - Search users
router.get('/search', searchUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', getUserById);

// POST /api/users - Create new user
router.post('/', requirePermission('admin'), createUser);

// PUT /api/users/:id - Update user
router.put('/:id', requirePermission('write'), updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', requirePermission('delete'), deleteUser);

export default router;