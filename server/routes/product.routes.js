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
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/products - Get all products
router.get('/', getAllProducts);

// GET /api/products/search - Search products
router.get('/search', searchProducts);

// GET /api/products/low-stock - Get low stock products
router.get('/low-stock', getLowStockProducts);

// GET /api/products/branch/:branchId - Get products by branch
router.get('/branch/:branchId', getProductsByBranch);

// GET /api/products/:id - Get product by ID
router.get('/:id', getProductById);

// POST /api/products - Create new product
router.post('/', requirePermission('write'), createProduct);

// PUT /api/products/:id - Update product
router.put('/:id', requirePermission('write'), updateProduct);

// DELETE /api/products/:id - Delete product
router.delete('/:id', requirePermission('delete'), deleteProduct);

export default router;


