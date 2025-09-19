import * as productService from '../services/product.service.js';

// Get all products
export const getAllProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, brand, branch, search } = req.query;
        
        const filters = {};
        if (category) filters.category = category;
        if (brand) filters.brand = brand;
        if (branch) filters.branch = branch;
        if (search) filters.search = search;

        const result = await productService.getAllProducts(filters, parseInt(page), parseInt(limit));
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get product by ID
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productService.getProductById(id);
        
        res.json({
            success: true,
            data: { product }
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// Create new product
export const createProduct = async (req, res) => {
    try {
        const productData = {
            ...req.body,
            createdBy: req.user._id
        };
        
        const product = await productService.createProduct(productData);
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: { product }
        });
    } catch (error) {
        const statusCode = error.message.includes('already exists') ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// Update product
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const product = await productService.updateProduct(id, updateData);
        
        res.json({
            success: true,
            message: 'Product updated successfully',
            data: { product }
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 
                          error.message.includes('already exists') ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// Delete product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productService.deleteProduct(id);
        
        res.json({
            success: true,
            message: 'Product deleted successfully',
            data: { product }
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// Get products by branch
export const getProductsByBranch = async (req, res) => {
    try {
        const { branchId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        const result = await productService.getProductsByBranch(
            branchId, 
            parseInt(page), 
            parseInt(limit)
        );
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Search products
export const searchProducts = async (req, res) => {
    try {
        const { q: searchTerm, category, branch } = req.query;
        
        if (!searchTerm) {
            return res.status(400).json({
                success: false,
                message: 'Search term is required'
            });
        }

        const filters = {};
        if (category) filters.category = category;
        if (branch) filters.branch = branch;

        const products = await productService.searchProducts(searchTerm, filters);
        
        res.json({
            success: true,
            data: { products }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get low stock products
export const getLowStockProducts = async (req, res) => {
    try {
        const { branch } = req.query;
        const products = await productService.getLowStockProducts(branch);
        
        res.json({
            success: true,
            data: { products }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


