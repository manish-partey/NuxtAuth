import { Document, Model, Types } from 'mongoose';

// Reusable roles to keep consistent across codebase
export const userRoles = ['super_admin', 'platform_admin', 'organization_admin', 'user'] as const;
export type UserRole = typeof userRoles[number];

export interface IUser {
  username: string;
  name: string;
  email: string;
  bio?: string;
  password: string;
  isVerified: boolean;
  verificationToken?: string | null;
  isVerificationTokenUsed?: boolean;
  verificationTokenExpiry?: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordExpiry?: Date | null;
  disabled?: boolean;
  role: UserRole;
  platformId?: Types.ObjectId;
  organizationId?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUserDocument> {}
