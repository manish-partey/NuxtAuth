// server/models/User.ts
import mongoose, { Schema } from 'mongoose'; // Import Schema here
import bcrypt from 'bcryptjs';
import { IUserDocument, IUserModel } from '../types/user.d'; // Import your new interfaces

const UserSchema = new mongoose.Schema<IUserDocument>({ // Use IUserDocument here
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: String,
    isVerificationTokenUsed: { type: Boolean, default: false }, // Optional: track if token was used
    verificationTokenExpiry: Date,
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
}, {
    timestamps: true,
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords - Ensure `this` context is correct for `IUserDocument`
UserSchema.methods.comparePassword = async function (this: IUserDocument, candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUserDocument, IUserModel>('User', UserSchema); // Use both interfaces here
export default User;