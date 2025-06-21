import { Document, Model } from 'mongoose';

// Possible user roles (match your User model roles)
export type UserRole = 'super_admin' | 'platform_admin' | 'organization_admin' | 'user';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  verificationToken?: string | null;
  isVerificationTokenUsed?: boolean;
  verificationTokenExpiry?: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordExpiry?: Date | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUserDocument> {
  // Define static methods if any
}
