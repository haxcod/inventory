// Permission middleware for role-based access control

export const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Admin has all permissions
        if (req.user.role === 'admin') {
            return next();
        }

        // Check if user has the required permission
        if (!req.user.permissions || !req.user.permissions.includes(permission)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
                required: permission,
                userPermissions: req.user.permissions
            });
        }

        next();
    };
};

// Multiple permissions check (user needs ANY of the permissions)
export const requireAnyPermission = (permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Admin has all permissions
        if (req.user.role === 'admin') {
            return next();
        }

        // Check if user has any of the required permissions
        const hasPermission = permissions.some(permission => 
            req.user.permissions && req.user.permissions.includes(permission)
        );

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
                required: permissions,
                userPermissions: req.user.permissions
            });
        }

        next();
    };
};

// All permissions check (user needs ALL of the permissions)
export const requireAllPermissions = (permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Admin has all permissions
        if (req.user.role === 'admin') {
            return next();
        }

        // Check if user has all of the required permissions
        const hasAllPermissions = permissions.every(permission => 
            req.user.permissions && req.user.permissions.includes(permission)
        );

        if (!hasAllPermissions) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
                required: permissions,
                userPermissions: req.user.permissions
            });
        }

        next();
    };
};

// Role-based middleware
export const requireRole = (roles) => {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roleArray.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient role privileges',
                required: roleArray,
                userRole: req.user.role
            });
        }

        next();
    };
};
