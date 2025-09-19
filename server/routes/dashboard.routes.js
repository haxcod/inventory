import express from 'express';
import { getDashboardData } from '../controllers/dashboard.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/dashboard - Get dashboard data
router.get('/', getDashboardData);

export default router;
