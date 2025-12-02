// server/models/User.ts
import mongoosePkg from 'mongoose';
const { Schema, model, models } = mongoosePkg;
import bcryptjs from 'bcryptjs';

// ✅ Lazy import to avoid circular dependency
const Organization = () => require('./Organization').default;

import type { IUserDocument, IUserModel } from '../types/user';

export const userRoles = ['super_admin', 'platform_admin', 'organization_admin', 'employee', 'guest'] as const;
export type UserRole = typeof userRoles[number];

const UserSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: { type: String, default: null },
    isVerificationTokenUsed: { type: Boolean, default: false },
    verificationTokenExpiry: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpiry: { type: Date, default: null },
    disabled: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: {
        values: userRoles,
        message: 'Role must be one of super_admin, platform_admin, organization_admin',
      },
      default: 'organization_admin',
    },
    platformId: {
      type: Schema.Types.ObjectId,
      ref: Organization, // Lazy reference to avoid circular dependency
      default: null,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: Organization, // Lazy reference to avoid circular dependency
      default: null,
    },
  },
  {
    timestamps: true,
    validateBeforeSave: true,
  }
);

// ✅ PASSWORD HASHING - BCRYPT ENABLED
// Pre-save hook to hash passwords before saving
UserSchema.pre('save', async function (next) {
  // Only hash if password is new or modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    console.log(`[User.preSave] Password hashed successfully for user: ${this.email}`);
    next();
  } catch (error: any) {
    console.error(`[User.preSave] Error hashing password: ${error.message}`);
    next(error);
  }
});

// ✅ Method to compare passwords - BCRYPT comparison
UserSchema.methods.comparePassword = async function (
  this: IUserDocument,
  candidatePassword: string
): Promise<boolean> {
  // Use bcrypt to compare hashed password with candidate password
  console.log(`[User.comparePassword] Comparing password for user: ${this.email}`);
  try {
    const isMatch = await bcryptjs.compare(candidatePassword, this.password);
    console.log(`[User.comparePassword] Match result: ${isMatch}`);
    return isMatch;
  } catch (error: any) {
    console.error(`[User.comparePassword] Error comparing passwords: ${error.message}`);
    return false;
  }
};

// ✅ Register model
const User = (models?.User || model<IUserDocument, IUserModel>('User', UserSchema));
export default User;
