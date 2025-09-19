import Invoice from '../models/Invoice.js';
import Product from '../models/Product.js';
import StockMovement from '../models/StockMovement.js';

// Generate unique invoice number
const generateInvoiceNumber = async () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const prefix = `INV-${year}${month}${day}`;
    
    // Find the last invoice for today
    const lastInvoice = await Invoice.findOne({
        invoiceNumber: { $regex: `^${prefix}` }
    }).sort({ invoiceNumber: -1 });
    
    let sequence = 1;
    if (lastInvoice) {
        const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[1].slice(8));
        sequence = lastSequence + 1;
    }
    
    return `${prefix}-${String(sequence).padStart(4, '0')}`;
};

// Get all invoices
export const getAllInvoices = async (filters = {}, page = 1, limit = 10) => {
    try {
        const query = {};
        
        // Apply filters
        if (filters.branch) query.branch = filters.branch;
        if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
        if (filters.customer) {
            query['customer.name'] = new RegExp(filters.customer, 'i');
        }
        if (filters.dateFrom || filters.dateTo) {
            query.createdAt = {};
            if (filters.dateFrom) {
                query.createdAt.$gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                query.createdAt.$lte = new Date(filters.dateTo);
            }
        }

        const skip = (page - 1) * limit;
        
        const invoices = await Invoice.find(query)
            .populate('branch', 'name address')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Invoice.countDocuments(query);

        return {
            invoices,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total,
                limit
            }
        };
    } catch (error) {
        throw new Error(`Failed to get invoices: ${error.message}`);
    }
};

// Get invoice by ID
export const getInvoiceById = async (invoiceId) => {
    try {
        const invoice = await Invoice.findById(invoiceId)
            .populate('branch', 'name address')
            .populate('createdBy', 'name email')
            .populate('items.product', 'name sku price');
        
        if (!invoice) {
            throw new Error('Invoice not found');
        }
        
        return invoice;
    } catch (error) {
        throw new Error(`Failed to get invoice: ${error.message}`);
    }
};

// Create new invoice
export const createInvoice = async (invoiceData, userId) => {
    try {
        // Generate invoice number
        const invoiceNumber = await generateInvoiceNumber();
        
        // Calculate totals
        let subtotal = 0;
        const items = [];
        
        for (const item of invoiceData.items) {
            const product = await Product.findById(item.product);
            if (!product) {
                throw new Error(`Product with ID ${item.product} not found`);
            }
            
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product ${product.name}`);
            }
            
            const itemTotal = (item.price * item.quantity) - (item.discount || 0);
            subtotal += itemTotal;
            
            items.push({
                product: item.product,
                quantity: item.quantity,
                price: item.price,
                discount: item.discount || 0,
                total: itemTotal
            });
        }
        
        const tax = (subtotal * (invoiceData.taxRate || 0)) / 100;
        const discount = invoiceData.discount || 0;
        const total = subtotal + tax - discount;
        
        // Create invoice
        const invoice = await Invoice.create({
            invoiceNumber,
            customer: invoiceData.customer,
            items,
            subtotal,
            tax,
            discount,
            total,
            paymentMethod: invoiceData.paymentMethod,
            paymentStatus: invoiceData.paymentStatus || 'pending',
            branch: invoiceData.branch,
            createdBy: userId,
            notes: invoiceData.notes
        });
        
        // Update product stock
        for (const item of items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: -item.quantity } }
            );
            
            // Create stock movement record
            await StockMovement.create({
                product: item.product,
                branch: invoiceData.branch,
                type: 'out',
                quantity: item.quantity,
                reason: `Invoice ${invoiceNumber}`,
                createdBy: userId
            });
        }
        
        return await getInvoiceById(invoice._id);
    } catch (error) {
        throw new Error(`Failed to create invoice: ${error.message}`);
    }
};

// Update invoice
export const updateInvoice = async (invoiceId, updateData) => {
    try {
        const invoice = await Invoice.findByIdAndUpdate(
            invoiceId,
            updateData,
            { new: true, runValidators: true }
        ).populate('branch', 'name address')
         .populate('createdBy', 'name email')
         .populate('items.product', 'name sku price');

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        return invoice;
    } catch (error) {
        throw new Error(`Failed to update invoice: ${error.message}`);
    }
};

// Delete invoice
export const deleteInvoice = async (invoiceId) => {
    try {
        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
            throw new Error('Invoice not found');
        }

        // Restore product stock
        for (const item of invoice.items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: item.quantity } }
            );
        }

        await Invoice.findByIdAndDelete(invoiceId);
        return { message: 'Invoice deleted successfully' };
    } catch (error) {
        throw new Error(`Failed to delete invoice: ${error.message}`);
    }
};

// Generate PDF for invoice
export const generateInvoicePDF = async (invoiceId) => {
    try {
        const invoice = await getInvoiceById(invoiceId);
        
        // In a real application, you would use a PDF generation library like puppeteer or pdfkit
        // For now, we'll return the invoice data that can be used to generate PDF
        return {
            invoice,
            pdfData: {
                invoiceNumber: invoice.invoiceNumber,
                customer: invoice.customer,
                items: invoice.items,
                subtotal: invoice.subtotal,
                tax: invoice.tax,
                discount: invoice.discount,
                total: invoice.total,
                createdAt: invoice.createdAt,
                branch: invoice.branch
            }
        };
    } catch (error) {
        throw new Error(`Failed to generate invoice PDF: ${error.message}`);
    }
};


