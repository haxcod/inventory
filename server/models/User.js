import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    permissions: [{
        type: String,
    }],
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    lastLogin: {
        type: Date,
    },
}, {
    timestamps: true,
});

// Indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ branch: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const bcrypt = await import('bcryptjs');
        this.password = await bcrypt.hash(this.password, 12);
        next();
    } catch (error) {
        next(error);
    }
});

// Pre-save middleware to set default permissions based on role
UserSchema.pre('save', function(next) {
    if (this.isNew && this.permissions.length === 0) {
        switch (this.role) {
            case 'admin':
                this.permissions = ['read', 'write', 'delete', 'admin'];
                break;
            default: // user
                this.permissions = ['read', 'write'];
        }
    }
    next();
});

// Instance method to check password
UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        const bcrypt = await import('bcryptjs');
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Static method to find by email
UserSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

const User = mongoose.model('User', UserSchema);

export default User;