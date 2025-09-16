import User from '../models/User.js';

// Get all users
export const getAllUsers = async (filters = {}, page = 1, limit = 10) => {
    try {
        const query = { isActive: true };
        
        // Apply filters
        if (filters.role) query.role = filters.role;
        if (filters.branch) query.branch = filters.branch;
        if (filters.$or) query.$or = filters.$or;

        const skip = (page - 1) * limit;
        
        const users = await User.find(query)
            .populate('branch', 'name address')
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(query);

        return {
            users,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total,
                limit
            }
        };
    } catch (error) {
        throw new Error(`Failed to get users: ${error.message}`);
    }
};

// Get user by ID
export const getUserById = async (userId) => {
    try {
        const user = await User.findById(userId)
            .populate('branch', 'name address')
            .select('-password');
        
        if (!user) {
            throw new Error('User not found');
        }
        
        return user;
    } catch (error) {
        throw new Error(`Failed to get user: ${error.message}`);
    }
};

// Create new user
export const createUser = async (userData) => {
    try {
        // Validation
        if (!userData.email || !userData.password || !userData.name) {
            throw new Error('Email, password and name are required');
        }
        
        if (userData.password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
        
        if (!userData.email.includes('@')) {
            throw new Error('Invalid email format');
        }
        
        if (userData.name.length < 3) {
            throw new Error('Name must be at least 3 characters long');
        }
        
        if (userData.role && !['admin', 'user'].includes(userData.role)) {
            throw new Error('Invalid role');
        }
        
        if (userData.branch && typeof userData.branch !== 'string') {
            throw new Error('Branch must be a string');
        }
        
        if (userData.branch && userData.branch.length !== 24) {
            throw new Error('Branch must be a valid ObjectId');
        }

        // Check if user already exists
        const existingUser = await User.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Create user (password will be hashed by pre-save middleware)
        const user = await User.create({
            ...userData,
            isActive: userData.isActive !== undefined ? userData.isActive : true
        });

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        return userResponse;
    } catch (error) {
        throw new Error(`Failed to create user: ${error.message}`);
    }
};

// Update user
export const updateUser = async (userId, updateData) => {
    try {
        // Check if email is being updated and if it already exists
        if (updateData.email) {
            const existingUser = await User.findOne({ 
                email: updateData.email, 
                _id: { $ne: userId } 
            });
            if (existingUser) {
                throw new Error('User with this email already exists');
            }
        }

        // Password will be hashed by pre-save middleware if provided
        if (updateData.password && updateData.password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).populate('branch', 'name address')
         .select('-password');

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    } catch (error) {
        throw new Error(`Failed to update user: ${error.message}`);
    }
};

// Delete user (soft delete)
export const deleteUser = async (userId) => {
    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { isActive: false },
            { new: true }
        ).select('-password');

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    } catch (error) {
        throw new Error(`Failed to delete user: ${error.message}`);
    }
};

// Search users
export const searchUsers = async (filters) => {
    try {
        const query = { 
            isActive: true,
            $or: [
                { name: new RegExp(filters.searchTerm, 'i') },
                { email: new RegExp(filters.searchTerm, 'i') }
            ]
        };

        // Apply additional filters
        if (filters.role) query.role = filters.role;
        if (filters.branch) query.branch = filters.branch;

        const users = await User.find(query)
            .populate('branch', 'name address')
            .select('-password')
            .limit(20);

        return users;
    } catch (error) {
        throw new Error(`Failed to search users: ${error.message}`);
    }
};