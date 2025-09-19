import Product from '../models/Product.js';
import StockMovement from '../models/StockMovement.js';

// Get all products with pagination and filtering
export const getAllProducts = async (filters = {}, page = 1, limit = 10) => {
    try {
        const query = { isActive: true };
        
        // Apply filters
        if (filters.category) query.category = new RegExp(filters.category, 'i');
        if (filters.brand) query.brand = new RegExp(filters.brand, 'i');
        if (filters.branch) query.branch = filters.branch;
        if (filters.search) {
            query.$or = [
                { name: new RegExp(filters.search, 'i') },
                { sku: new RegExp(filters.search, 'i') },
                { barcode: new RegExp(filters.search, 'i') }
            ];
        }

        const skip = (page - 1) * limit;
        
        const products = await Product.find(query)
            .populate('branch', 'name address')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments(query);

        return {
            products,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total,
                limit
            }
        };
    } catch (error) {
        throw new Error(`Failed to get products: ${error.message}`);
    }
};

// Get product by ID
export const getProductById = async (productId) => {
    try {
        const product = await Product.findById(productId)
            .populate('branch', 'name address');
        
        if (!product) {
            throw new Error('Product not found');
        }
        
        return product;
    } catch (error) {
        throw new Error(`Failed to get product: ${error.message}`);
    }
};

// Create new product
export const createProduct = async (productData) => {
    try {
        // Check if SKU already exists
        const existingProduct = await Product.findOne({ sku: productData.sku });
        if (existingProduct) {
            throw new Error('Product with this SKU already exists');
        }

        // Check if barcode already exists (if provided)
        if (productData.barcode) {
            const existingBarcode = await Product.findOne({ barcode: productData.barcode });
            if (existingBarcode) {
                throw new Error('Product with this barcode already exists');
            }
        }

        const product = await Product.create(productData);
        return product;
    } catch (error) {
        throw new Error(`Failed to create product: ${error.message}`);
    }
};

// Update product
export const updateProduct = async (productId, updateData) => {
    try {
        // Check if SKU is being updated and if it already exists
        if (updateData.sku) {
            const existingProduct = await Product.findOne({ 
                sku: updateData.sku, 
                _id: { $ne: productId } 
            });
            if (existingProduct) {
                throw new Error('Product with this SKU already exists');
            }
        }

        // Check if barcode is being updated and if it already exists
        if (updateData.barcode) {
            const existingBarcode = await Product.findOne({ 
                barcode: updateData.barcode, 
                _id: { $ne: productId } 
            });
            if (existingBarcode) {
                throw new Error('Product with this barcode already exists');
            }
        }

        const product = await Product.findByIdAndUpdate(
            productId,
            updateData,
            { new: true, runValidators: true }
        ).populate('branch', 'name address');

        if (!product) {
            throw new Error('Product not found');
        }

        return product;
    } catch (error) {
        throw new Error(`Failed to update product: ${error.message}`);
    }
};

// Delete product (soft delete)
export const deleteProduct = async (productId) => {
    try {
        const product = await Product.findByIdAndUpdate(
            productId,
            { isActive: false },
            { new: true }
        );

        if (!product) {
            throw new Error('Product not found');
        }

        return product;
    } catch (error) {
        throw new Error(`Failed to delete product: ${error.message}`);
    }
};

// Get products by branch
export const getProductsByBranch = async (branchId, page = 1, limit = 10) => {
    try {
        const query = { branch: branchId, isActive: true };
        const skip = (page - 1) * limit;
        
        const products = await Product.find(query)
            .populate('branch', 'name address')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments(query);

        return {
            products,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total,
                limit
            }
        };
    } catch (error) {
        throw new Error(`Failed to get products by branch: ${error.message}`);
    }
};

// Search products
export const searchProducts = async (searchTerm, filters = {}) => {
    try {
        const query = { 
            isActive: true,
            $or: [
                { name: new RegExp(searchTerm, 'i') },
                { sku: new RegExp(searchTerm, 'i') },
                { barcode: new RegExp(searchTerm, 'i') },
                { category: new RegExp(searchTerm, 'i') },
                { brand: new RegExp(searchTerm, 'i') }
            ]
        };

        // Apply additional filters
        if (filters.category) query.category = new RegExp(filters.category, 'i');
        if (filters.branch) query.branch = filters.branch;

        const products = await Product.find(query)
            .populate('branch', 'name address')
            .limit(20);

        return products;
    } catch (error) {
        throw new Error(`Failed to search products: ${error.message}`);
    }
};

// Get low stock products
export const getLowStockProducts = async (branchId = null) => {
    try {
        const query = { 
            isActive: true,
            $expr: { $lte: ['$stock', '$minStock'] }
        };

        if (branchId) {
            query.branch = branchId;
        }

        const products = await Product.find(query)
            .populate('branch', 'name address')
            .sort({ stock: 1 });

        return products;
    } catch (error) {
        throw new Error(`Failed to get low stock products: ${error.message}`);
    }
};

// Update stock
export const updateStock = async (productId, quantity, type, reason, userId) => {
    try {
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        let newStock;
        if (type === 'in') {
            newStock = product.stock + quantity;
        } else if (type === 'out') {
            if (product.stock < quantity) {
                throw new Error('Insufficient stock');
            }
            newStock = product.stock - quantity;
        } else {
            throw new Error('Invalid stock movement type');
        }

        // Update product stock
        product.stock = newStock;
        await product.save();

        // Create stock movement record
        await StockMovement.create({
            product: productId,
            branch: product.branch,
            type,
            quantity,
            reason,
            createdBy: userId
        });

        return product;
    } catch (error) {
        throw new Error(`Failed to update stock: ${error.message}`);
    }
};


