// server/models/User.ts
import mongoosePkg from 'mongoose';
const { Schema, model, models } = mongoosePkg;
import bcrypt from 'bcryptjs';
import { IUserDocument, IUserModel } from '../types/user';

export const userRoles = ['super_admin', 'platform_admin', 'org_admin', 'user'] as const;
export type UserRole = typeof userRoles[number];

const UserSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    isVerificationTokenUsed: {
      type: Boolean,
      default: false,
    },
    verificationTokenExpiry: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpiry: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: userRoles,
      default: 'user',
    },
    platformId: {
      type: Schema.Types.ObjectId,
      ref: 'Platform',
      index: true,
      required: false,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password if modified
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Compares plain password with hashed one
 * @param candidatePassword Plain text password
 * @returns Promise<boolean>
 */
UserSchema.methods.comparePassword = async function (
  this: IUserDocument,
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = models.User || model<IUserDocument, IUserModel>('User', UserSchema);

export default User;
