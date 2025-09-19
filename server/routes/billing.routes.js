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
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/billing/invoices - Get all invoices
router.get('/invoices', getAllInvoices);

// GET /api/billing/invoices/:id - Get invoice by ID
router.get('/invoices/:id', getInvoiceById);

// POST /api/billing/invoices - Create new invoice
router.post('/invoices', requirePermission('write'), createInvoice);

// PUT /api/billing/invoices/:id - Update invoice
router.put('/invoices/:id', requirePermission('write'), updateInvoice);

// DELETE /api/billing/invoices/:id - Delete invoice
router.delete('/invoices/:id', requirePermission('delete'), deleteInvoice);

// GET /api/billing/invoices/:id/pdf - Generate invoice PDF
router.get('/invoices/:id/pdf', generateInvoicePDF);

// POST /api/billing/qr-scan - QR code scan
router.post('/qr-scan', qrCodeScan);

export default router;


