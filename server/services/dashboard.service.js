import Invoice from '../models/Invoice.js';
import Product from '../models/Product.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import Branch from '../models/Branch.js';

// Get dashboard data
export const getDashboardData = async (period = 'monthly') => {
    try {
        // Calculate date range based on period
        const now = new Date();
        let startDate, endDate;
        
        switch (period) {
            case 'daily':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                break;
            case 'weekly':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                endDate = now;
                break;
            case 'monthly':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                break;
            case 'yearly':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear() + 1, 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        }

        // Get all data in parallel
        const [
            invoices,
            products,
            payments,
            users,
            branches
        ] = await Promise.all([
            Invoice.find({
                createdAt: { $gte: startDate, $lt: endDate }
            }),
            Product.find({ isActive: true }),
            Payment.find({
                createdAt: { $gte: startDate, $lt: endDate }
            }),
            User.find({ isActive: true }),
            Branch.find({ isActive: true })
        ]);

        // Calculate stats
        const totalSales = invoices.length; // Number of sales transactions
        const totalProducts = products.length; // Total products in inventory
        const totalInvoices = invoices.length; // Number of invoices
        const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
        const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);

        // Calculate growth (compare with previous period)
        const previousStartDate = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
        const previousEndDate = startDate;

        const [
            previousInvoices,
            previousProducts,
            previousPayments
        ] = await Promise.all([
            Invoice.find({
                createdAt: { $gte: previousStartDate, $lt: previousEndDate }
            }),
            Product.find({ isActive: true }),
            Payment.find({
                createdAt: { $gte: previousStartDate, $lt: previousEndDate }
            })
        ]);

        const previousSales = previousInvoices.length;
        const previousRevenue = previousInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
        const previousPaymentsAmount = previousPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const previousProductsCount = previousProducts.length;

        const salesGrowth = previousSales > 0 ? ((totalSales - previousSales) / previousSales) * 100 : 0;
        const productGrowth = previousProductsCount > 0 ? ((totalProducts - previousProductsCount) / previousProductsCount) * 100 : 0;
        const invoiceGrowth = previousInvoices.length > 0 ? ((totalInvoices - previousInvoices.length) / previousInvoices.length) * 100 : 0;
        const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

        // Generate chart data for sales
        const salesData = [];
        const daysInPeriod = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const maxDays = period === 'daily' ? 1 : period === 'weekly' ? 7 : period === 'monthly' ? 30 : 365;
        
        for (let i = 0; i < Math.min(daysInPeriod, maxDays); i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            const dayInvoices = invoices.filter(invoice => 
                invoice.createdAt.toDateString() === date.toDateString()
            );
            const daySales = dayInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
            
            salesData.push({
                name: date.toLocaleDateString('en-US', { 
                    weekday: period === 'daily' ? 'long' : 'short',
                    month: period === 'yearly' ? 'short' : undefined,
                    day: period === 'yearly' ? 'numeric' : undefined
                }),
                sales: daySales,
                value: daySales
            });
        }

        // Generate product data by category
        const productData = [];
        const categoryStats = {};
        products.forEach(product => {
            if (!categoryStats[product.category]) {
                categoryStats[product.category] = { count: 0, value: 0 };
            }
            categoryStats[product.category].count += 1;
            categoryStats[product.category].value += product.stock;
        });

        Object.entries(categoryStats).forEach(([category, stats]) => {
            productData.push({
                name: category,
                totalProducts: stats.count,
                value: stats.count
            });
        });

        return {
            stats: {
                totalSales,
                totalProducts,
                totalInvoices,
                totalRevenue,
                totalPayments,
                salesGrowth: Math.round(salesGrowth * 100) / 100,
                productGrowth: Math.round(productGrowth * 100) / 100,
                invoiceGrowth: Math.round(invoiceGrowth * 100) / 100,
                revenueGrowth: Math.round(revenueGrowth * 100) / 100
            },
            salesData,
            productData,
            recentInvoices: invoices.slice(0, 5).map(invoice => ({
                id: invoice._id,
                invoiceNumber: invoice.invoiceNumber,
                customer: invoice.customer?.name || 'Unknown',
                amount: invoice.total,
                date: invoice.createdAt
            })),
            lowStockProducts: products
                .filter(p => p.stock <= p.minStock)
                .slice(0, 5)
                .map(product => ({
                    id: product._id,
                    name: product.name,
                    stock: product.stock,
                    minStock: product.minStock
                })),
            summary: {
                totalUsers: users.length,
                totalBranches: branches.length,
                averageOrderValue: totalInvoices > 0 ? Math.round(totalRevenue / totalInvoices) : 0,
                period: period,
                dateRange: {
                    start: startDate,
                    end: endDate
                }
            }
        };
    } catch (error) {
        throw new Error(`Failed to get dashboard data: ${error.message}`);
    }
};
