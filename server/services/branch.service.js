import Branch from '../models/Branch.js';

// Get all branches
export const getAllBranches = async (page = 1, limit = 10) => {
    try {
        const query = { isActive: true };
        const skip = (page - 1) * limit;
        
        const branches = await Branch.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Branch.countDocuments(query);

        return {
            branches,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total,
                limit
            }
        };
    } catch (error) {
        throw new Error(`Failed to get branches: ${error.message}`);
    }
};

// Get branch by ID
export const getBranchById = async (branchId) => {
    try {
        const branch = await Branch.findById(branchId);
        
        if (!branch) {
            throw new Error('Branch not found');
        }
        
        return branch;
    } catch (error) {
        throw new Error(`Failed to get branch: ${error.message}`);
    }
};

// Create new branch
export const createBranch = async (branchData) => {
    try {
        // Check if branch with same name already exists
        const existingBranch = await Branch.findOne({ 
            name: branchData.name,
            isActive: true 
        });
        
        if (existingBranch) {
            throw new Error('Branch with this name already exists');
        }

        const branch = await Branch.create(branchData);
        return branch;
    } catch (error) {
        throw new Error(`Failed to create branch: ${error.message}`);
    }
};

// Update branch
export const updateBranch = async (branchId, updateData) => {
    try {
        // Check if name is being updated and if it already exists
        if (updateData.name) {
            const existingBranch = await Branch.findOne({ 
                name: updateData.name, 
                _id: { $ne: branchId },
                isActive: true
            });
            if (existingBranch) {
                throw new Error('Branch with this name already exists');
            }
        }

        const branch = await Branch.findByIdAndUpdate(
            branchId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!branch) {
            throw new Error('Branch not found');
        }

        return branch;
    } catch (error) {
        throw new Error(`Failed to update branch: ${error.message}`);
    }
};

// Delete branch (soft delete)
export const deleteBranch = async (branchId) => {
    try {
        const branch = await Branch.findByIdAndUpdate(
            branchId,
            { isActive: false },
            { new: true }
        );

        if (!branch) {
            throw new Error('Branch not found');
        }

        return branch;
    } catch (error) {
        throw new Error(`Failed to delete branch: ${error.message}`);
    }
};

// Search branches
export const searchBranches = async (searchTerm) => {
    try {
        const query = { 
            isActive: true,
            $or: [
                { name: new RegExp(searchTerm, 'i') },
                { address: new RegExp(searchTerm, 'i') },
                { manager: new RegExp(searchTerm, 'i') }
            ]
        };

        const branches = await Branch.find(query)
            .sort({ name: 1 })
            .limit(20);

        return branches;
    } catch (error) {
        throw new Error(`Failed to search branches: ${error.message}`);
    }
};

