// types/user.d.ts
import { Document, Model } from 'mongoose';

// Interface for the document properties (what's actually in the database)
export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  verificationToken?: string;
  isVerificationTokenUsed?: boolean; // Add this if you added it in User.ts
  verificationTokenExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  role: 'user' | 'admin';
  createdAt: Date; // Mongoose adds these with timestamps: true
  updatedAt: Date; // Mongoose adds these with timestamps: true

  // Define your instance methods here:
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Interface for the Mongoose Model (for static methods, if any)
export interface IUserModel extends Model<IUserDocument> {
  // Add any static methods you define on your User model here.
  // Example: findByEmail(email: string): Promise<IUserDocument | null>;
}