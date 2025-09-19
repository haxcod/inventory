import * as dashboardService from '../services/dashboard.service.js';

// Get dashboard data
export const getDashboardData = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        
        const dashboardData = await dashboardService.getDashboardData(period);
        
        res.json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
