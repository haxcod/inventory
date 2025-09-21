import express from 'express';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByBranch,
    searchProducts,
    getLowStockProducts
} from '../controllers/product.controller.js';
import { authenticateToken, filterByBranch } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Apply branch filtering for data retrieval routes
router.use(filterByBranch);

// GET /api/products - Get all products (users can view)
router.get('/', requirePermission('products.view'), getAllProducts);

// GET /api/products/search - Search products (users can view)
router.get('/search', requirePermission('products.view'), searchProducts);

// GET /api/products/low-stock - Get low stock products (users can view)
router.get('/low-stock', requirePermission('products.view'), getLowStockProducts);

// GET /api/products/branch/:branchId - Get products by branch (users can view)
router.get('/branch/:branchId', requirePermission('products.view'), getProductsByBranch);

// GET /api/products/:id - Get product by ID (users can view)
router.get('/:id', requirePermission('products.view'), getProductById);

// POST /api/products - Create new product (admin only)
router.post('/', requirePermission('products.create'), createProduct);

// PUT /api/products/:id - Update product (admin only)
router.put('/:id', requirePermission('products.edit'), updateProduct);

// DELETE /api/products/:id - Delete product (admin only)
router.delete('/:id', requirePermission('products.delete'), deleteProduct);

export default router;


