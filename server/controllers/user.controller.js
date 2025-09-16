import * as userService from '../services/user.service.js';

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, branch, search } = req.query;
        
        const filters = {};
        if (role) filters.role = role;
        if (branch) filters.branch = branch;
        if (search) {
            filters.$or = [
                { name: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') }
            ];
        }

        const result = await userService.getAllUsers(filters, parseInt(page), parseInt(limit));
        
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

// Get user by ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        
        res.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// Create new user
export const createUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body);
        
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { user }
        });
    } catch (error) {
        const statusCode = error.message.includes('already exists') || 
                          error.message.includes('required') ||
                          error.message.includes('Invalid') ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.updateUser(id, req.body);
        
        res.json({
            success: true,
            message: 'User updated successfully',
            data: { user }
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

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.deleteUser(id);
        
        res.json({
            success: true,
            message: 'User deleted successfully',
            data: { user }
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// Search users
export const searchUsers = async (req, res) => {
    try {
        const { q: searchTerm, role, branch } = req.query;
        
        if (!searchTerm) {
            return res.status(400).json({
                success: false,
                message: 'Search term is required'
            });
        }

        const filters = { searchTerm };
        if (role) filters.role = role;
        if (branch) filters.branch = branch;

        const users = await userService.searchUsers(filters);
        
        res.json({
            success: true,
            data: { users }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};