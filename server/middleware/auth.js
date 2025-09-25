import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId)
            .select('-password')
            .populate('branch', 'name address phone email manager');
        
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or inactive user'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

export const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Check if user has 'all' permissions or the specific permission
        if (!req.user.permissions.includes('all') && !req.user.permissions.includes(permission)) {
            return res.status(403).json({
                success: false,
                message: `Permission '${permission}' required`
            });
        }

        next();
    };
};

// Middleware to filter data by user's branch (for non-admin users)
export const filterByBranch = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    // Simple role check: admin can see all data, team can only see their branch
    const isAdmin = req.user.role === 'admin';
    
    if (isAdmin) {
        return next();
    }

    // For team users (role: 'team'), add branch filter to query
    if (req.user.branch) {
        req.branchFilter = { branch: req.user.branch._id || req.user.branch };
    } else {
        // If team user has no branch assigned, they can't see any data
        return res.status(403).json({
            success: false,
            message: 'No branch assigned to user'
        });
    }

    next();
};
