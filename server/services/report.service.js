import Invoice from '../models/Invoice.js';
import Product from '../models/Product.js';
import Payment from '../models/Payment.js';
import StockMovement from '../models/StockMovement.js';

// Get sales report
export const getSalesReport = async (filters = {}) => {
    try {
        const query = {};
        
        // Apply date filters
        if (filters.dateFrom || filters.dateTo) {
            query.createdAt = {};
            if (filters.dateFrom) {
                query.createdAt.$gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                query.createdAt.$lte = new Date(filters.dateTo);
            }
        }
        
        if (filters.branch) {
            query.branch = filters.branch;
        }

        const invoices = await Invoice.find(query)
            .populate('branch', 'name')
            .sort({ createdAt: -1 });

        // Calculate totals
        const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
        const totalInvoices = invoices.length;
        const averageOrderValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

        // Group by period for chart data
        const salesByPeriod = {};
        const period = filters.period || 'daily'; // Default to daily if not specified
        
        invoices.forEach(invoice => {
            let periodKey;
            let periodLabel;
            
            switch (period) {
                case 'daily':
                    periodKey = invoice.createdAt.toISOString().split('T')[0];
                    periodLabel = periodKey;
                    break;
                case 'weekly':
                    // Get start of week (Monday)
                    const weekStart = new Date(invoice.createdAt);
                    const dayOfWeek = weekStart.getDay();
                    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                    weekStart.setDate(weekStart.getDate() + daysToMonday);
                    periodKey = weekStart.toISOString().split('T')[0];
                    periodLabel = `Week of ${periodKey}`;
                    break;
                case 'monthly':
                    periodKey = invoice.createdAt.toISOString().substring(0, 7); // YYYY-MM
                    periodLabel = new Date(invoice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
                    break;
                case 'yearly':
                    periodKey = invoice.createdAt.getFullYear().toString();
                    periodLabel = periodKey;
                    break;
                default:
                    periodKey = invoice.createdAt.toISOString().split('T')[0];
                    periodLabel = periodKey;
            }
            
            if (!salesByPeriod[periodKey]) {
                salesByPeriod[periodKey] = { date: periodLabel, revenue: 0, count: 0 };
            }
            salesByPeriod[periodKey].revenue += invoice.total;
            salesByPeriod[periodKey].count += 1;
        });

        // Fill in missing periods to ensure continuous data
        const chartData = [];
        if (Object.keys(salesByPeriod).length > 0) {
            const periods = Object.keys(salesByPeriod).sort();
            const startPeriod = periods[0];
            const endPeriod = periods[periods.length - 1];
            
            // Generate continuous periods based on the selected period type
            if (period === 'daily') {
                const startDate = new Date(startPeriod);
                const endDate = new Date(endPeriod);
                
                for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                    const dateStr = d.toISOString().split('T')[0];
                    chartData.push({
                        date: dateStr,
                        revenue: salesByPeriod[dateStr]?.revenue || 0,
                        count: salesByPeriod[dateStr]?.count || 0
                    });
                }
            } else if (period === 'weekly') {
                const startDate = new Date(startPeriod);
                const endDate = new Date(endPeriod);
                
                // Always include at least one previous week for continuous line
                const actualStartDate = new Date(startDate);
                actualStartDate.setDate(actualStartDate.getDate() - 7);
                
                for (let d = new Date(actualStartDate); d <= endDate; d.setDate(d.getDate() + 7)) {
                    const weekStart = d.toISOString().split('T')[0];
                    chartData.push({
                        date: `Week of ${weekStart}`,
                        revenue: salesByPeriod[weekStart]?.revenue || 0,
                        count: salesByPeriod[weekStart]?.count || 0
                    });
                }
            } else if (period === 'monthly') {
                const startMonth = new Date(startPeriod + '-01');
                const endMonth = new Date(endPeriod + '-01');
                
                // Always include at least one previous month for continuous line
                const actualStartMonth = new Date(startMonth);
                actualStartMonth.setMonth(actualStartMonth.getMonth() - 1);
                
                for (let d = new Date(actualStartMonth); d <= endMonth; d.setMonth(d.getMonth() + 1)) {
                    const monthStr = d.toISOString().substring(0, 7);
                    chartData.push({
                        date: d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
                        revenue: salesByPeriod[monthStr]?.revenue || 0,
                        count: salesByPeriod[monthStr]?.count || 0
                    });
                }
            } else if (period === 'yearly') {
                const startYear = parseInt(startPeriod);
                const endYear = parseInt(endPeriod);
                
                // Always include at least one previous year for continuous line
                const actualStartYear = startYear - 1;
                
                for (let year = actualStartYear; year <= endYear; year++) {
                    chartData.push({
                        date: year.toString(),
                        revenue: salesByPeriod[year.toString()]?.revenue || 0,
                        count: salesByPeriod[year.toString()]?.count || 0
                    });
                }
            }
        } else {
            // If no data exists, still create at least 2 periods for continuous line
            if (period === 'monthly') {
                const currentDate = new Date();
                const currentMonth = currentDate.toISOString().substring(0, 7);
                const previousMonth = new Date(currentDate);
                previousMonth.setMonth(previousMonth.getMonth() - 1);
                const previousMonthStr = previousMonth.toISOString().substring(0, 7);
                
                chartData.push({
                    date: previousMonth.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
                    revenue: 0,
                    count: 0
                });
                chartData.push({
                    date: currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
                    revenue: 0,
                    count: 0
                });
            }
        }

        // Group by payment method
        const paymentMethodStats = {};
        invoices.forEach(invoice => {
            if (!paymentMethodStats[invoice.paymentMethod]) {
                paymentMethodStats[invoice.paymentMethod] = { method: invoice.paymentMethod, count: 0, revenue: 0 };
            }
            paymentMethodStats[invoice.paymentMethod].count += 1;
            paymentMethodStats[invoice.paymentMethod].revenue += invoice.total;
        });

        return {
            summary: {
                totalRevenue,
                totalInvoices,
                averageOrderValue
            },
            chartData,
            paymentMethodStats: Object.values(paymentMethodStats)
        };
    } catch (error) {
        throw new Error(`Failed to get sales report: ${error.message}`);
    }
};

// Get stock report
export const getStockReport = async (filters = {}) => {
    try {
        const query = { isActive: true };
        
        if (filters.branch) {
            query.branch = filters.branch;
        }
        if (filters.category) {
            query.category = new RegExp(filters.category, 'i');
        }

        const products = await Product.find(query)
            .populate('branch', 'name')
            .sort({ stock: 1 });

        // Calculate stock statistics
        const totalProducts = products.length;
        const lowStockProducts = products.filter(p => p.stock <= p.minStock);
        const outOfStockProducts = products.filter(p => p.stock === 0);
        const totalStockValue = products.reduce((sum, product) => sum + (product.stock * product.costPrice), 0);

        // Group by category
        const categoryStats = {};
        products.forEach(product => {
            if (!categoryStats[product.category]) {
                categoryStats[product.category] = { 
                    category: product.category, 
                    count: 0, 
                    totalStock: 0, 
                    totalValue: 0 
                };
            }
            categoryStats[product.category].count += 1;
            categoryStats[product.category].totalStock += product.stock;
            categoryStats[product.category].totalValue += (product.stock * product.costPrice);
        });

        return {
            summary: {
                totalProducts,
                lowStockProducts: lowStockProducts.length,
                outOfStockProducts: outOfStockProducts.length,
                totalStockValue
            },
            lowStockProducts: lowStockProducts.slice(0, 10), // Top 10 low stock
            outOfStockProducts: outOfStockProducts.slice(0, 10), // Top 10 out of stock
            categoryStats: Object.values(categoryStats)
        };
    } catch (error) {
        throw new Error(`Failed to get stock report: ${error.message}`);
    }
};

// Get payment report
export const getPaymentReport = async (filters = {}) => {
    try {
        const query = {};
        
        // Apply date filters
        if (filters.dateFrom || filters.dateTo) {
            query.createdAt = {};
            if (filters.dateFrom) {
                query.createdAt.$gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                query.createdAt.$lte = new Date(filters.dateTo);
            }
        }
        
        if (filters.branch) {
            query.branch = filters.branch;
        }

        const payments = await Payment.find(query)
            .populate('branch', 'name')
            .sort({ createdAt: -1 });

        // Calculate totals
        const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const totalPayments = payments.length;

        // Group by payment method
        const paymentMethodStats = {};
        payments.forEach(payment => {
            if (!paymentMethodStats[payment.paymentMethod]) {
                paymentMethodStats[payment.paymentMethod] = { 
                    method: payment.paymentMethod, 
                    count: 0, 
                    amount: 0 
                };
            }
            paymentMethodStats[payment.paymentMethod].count += 1;
            paymentMethodStats[payment.paymentMethod].amount += payment.amount;
        });

        // Group by payment type
        const paymentTypeStats = {};
        payments.forEach(payment => {
            if (!paymentTypeStats[payment.paymentType]) {
                paymentTypeStats[payment.paymentType] = { 
                    type: payment.paymentType, 
                    count: 0, 
                    amount: 0 
                };
            }
            paymentTypeStats[payment.paymentType].count += 1;
            paymentTypeStats[payment.paymentType].amount += payment.amount;
        });

        return {
            summary: {
                totalAmount,
                totalPayments
            },
            paymentMethodStats: Object.values(paymentMethodStats),
            paymentTypeStats: Object.values(paymentTypeStats)
        };
    } catch (error) {
        throw new Error(`Failed to get payment report: ${error.message}`);
    }
};

// Get profit/loss report
export const getProfitLossReport = async (filters = {}) => {
    try {
        const query = {};
        
        // Apply date filters
        if (filters.startDate || filters.endDate) {
            query.createdAt = {};
            if (filters.startDate) {
                query.createdAt.$gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                query.createdAt.$lte = new Date(filters.endDate);
            }
        }
        
        if (filters.branch) {
            query.branch = filters.branch;
        }

        const invoices = await Invoice.find(query)
            .populate('branch', 'name')
            .sort({ createdAt: -1 });

        const payments = await Payment.find(query)
            .populate('branch', 'name')
            .sort({ createdAt: -1 });

        // Calculate revenue from invoices
        const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
        
        // Calculate expenses from payments (debit payments)
        const totalExpenses = payments
            .filter(payment => payment.paymentType === 'debit')
            .reduce((sum, payment) => sum + payment.amount, 0);

        const netProfit = totalRevenue - totalExpenses;

        // Group by month for chart data
        const monthlyData = {};
        invoices.forEach(invoice => {
            const month = invoice.createdAt.toISOString().substring(0, 7); // YYYY-MM
            if (!monthlyData[month]) {
                monthlyData[month] = { month, revenue: 0, expenses: 0, profit: 0 };
            }
            monthlyData[month].revenue += invoice.total;
        });

        payments.forEach(payment => {
            if (payment.paymentType === 'debit') {
                const month = payment.createdAt.toISOString().substring(0, 7);
                if (!monthlyData[month]) {
                    monthlyData[month] = { month, revenue: 0, expenses: 0, profit: 0 };
                }
                monthlyData[month].expenses += payment.amount;
            }
        });

        // Fill in missing months to ensure continuous data
        const chartData = [];
        if (Object.keys(monthlyData).length > 0) {
            const months = Object.keys(monthlyData).sort();
            const startMonth = new Date(months[0] + '-01');
            const endMonth = new Date(months[months.length - 1] + '-01');
            
            for (let d = new Date(startMonth); d <= endMonth; d.setMonth(d.getMonth() + 1)) {
                const monthStr = d.toISOString().substring(0, 7);
                const monthData = monthlyData[monthStr] || { month: monthStr, revenue: 0, expenses: 0, profit: 0 };
                monthData.profit = monthData.revenue - monthData.expenses;
                chartData.push(monthData);
            }
        }

        return {
            summary: {
                totalRevenue,
                totalExpenses,
                netProfit,
                profitMargin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0
            },
            chartData
        };
    } catch (error) {
        throw new Error(`Failed to get profit/loss report: ${error.message}`);
    }
};


