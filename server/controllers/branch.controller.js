import * as branchService from '../services/branch.service.js';

// Get all branches
export const getAllBranches = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const result = await branchService.getAllBranches(parseInt(page), parseInt(limit));
        
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

// Get branch by ID
export const getBranchById = async (req, res) => {
    try {
        const { id } = req.params;
        const branch = await branchService.getBranchById(id);
        
        res.json({
            success: true,
            data: { branch }
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// Create new branch
export const createBranch = async (req, res) => {
    try {
        const branch = await branchService.createBranch(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Branch created successfully',
            data: { branch }
        });
    } catch (error) {
        const statusCode = error.message.includes('already exists') ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// Update branch
export const updateBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const branch = await branchService.updateBranch(id, req.body);
        
        res.json({
            success: true,
            message: 'Branch updated successfully',
            data: { branch }
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

// Delete branch
export const deleteBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const branch = await branchService.deleteBranch(id);
        
        res.json({
            success: true,
            message: 'Branch deleted successfully',
            data: { branch }
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// Search branches
export const searchBranches = async (req, res) => {
    try {
        const { q: searchTerm } = req.query;
        
        if (!searchTerm) {
            return res.status(400).json({
                success: false,
                message: 'Search term is required'
            });
        }

        const branches = await branchService.searchBranches(searchTerm);
        
        res.json({
            success: true,
            data: { branches }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


