import mongoosePkg from 'mongoose';
const { Schema, model, models } = mongoosePkg;
import bcrypt from 'bcryptjs';
import { IUserDocument, IUserModel } from '../types/user';

export const userRoles = ['super_admin', 'platform_admin', 'organization_admin', 'user'] as const;
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
      enum: {
        values: userRoles,
        message: 'Role must be one of super_admin, platform_admin, organization_admin, user',
      },
      default: 'user',
    },
    platformId: {
      type: Schema.Types.ObjectId,
      default: null,
      required: false,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      default: null,
      required: false,
    }

  },
  {
    timestamps: true,
    validateBeforeSave: true,
  }
);

// Pre-save hook to hash password if modified
UserSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error('❌ Error hashing password:', error);
    next(error);
  }
});

// Debug log before saving (optional)
UserSchema.pre('save', function (next) {
  console.log('📦 About to save user:', this.toObject());
  next();
});

// Compare passwords
UserSchema.methods.comparePassword = async function (
  this: IUserDocument,
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = models.User || model<IUserDocument, IUserModel>('User', UserSchema);

export default User;
