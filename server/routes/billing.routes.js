import express from 'express';
import {
    getAllInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    generateInvoicePDF,
    qrCodeScan
} from '../controllers/billing.controller.js';
import { authenticateToken, filterByBranch } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Apply branch filtering for data retrieval routes
router.use(filterByBranch);

// GET /api/billing/invoices - Get all invoices (users can view)
router.get('/invoices', requirePermission('invoices.view'), getAllInvoices);

// GET /api/billing/invoices/:id - Get invoice by ID (users can view)
router.get('/invoices/:id', requirePermission('invoices.view'), getInvoiceById);

// POST /api/billing/invoices - Create new invoice (users can create)
router.post('/invoices', requirePermission('invoices.create'), createInvoice);

// PUT /api/billing/invoices/:id - Update invoice (users can edit)
router.put('/invoices/:id', requirePermission('invoices.edit'), updateInvoice);

// DELETE /api/billing/invoices/:id - Delete invoice (admin only)
router.delete('/invoices/:id', requirePermission('invoices.delete'), deleteInvoice);

// GET /api/billing/invoices/:id/pdf - Generate invoice PDF (users can view)
router.get('/invoices/:id/pdf', requirePermission('invoices.view'), generateInvoicePDF);

// POST /api/billing/qr-scan - QR code scan (users can use)
router.post('/qr-scan', requirePermission('billing.view'), qrCodeScan);

export default router;


