import type { Document, Model, Types } from 'mongoose';

export type UserRole = 'super_admin' | 'platform_admin' | 'organization_admin' | 'manager' | 'employee' | 'guest';

export interface IUser {
  username: string;
  name: string;
  email: string;
  password: string;
  isVerified?: boolean;
  verificationToken?: string | null;
  isVerificationTokenUsed?: boolean;
  verificationTokenExpiry?: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordExpiry?: Date | null;
  role?: UserRole;
  platformId?: Types.ObjectId | null;
  organizationId?: Types.ObjectId | null;
}

export interface IUserDocument extends IUser, Document {
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUserDocument> {
  // Static methods can go here (optional)
}
