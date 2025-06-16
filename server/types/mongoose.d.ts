// server/types/mongoose.d.ts
import { Document } from 'mongoose';

// Custom interface extending Mongoose Document for User
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // optional because it might be omitted in some queries
  isVerified: boolean;
  verificationToken?: string | null;
  verificationTokenExpiry?: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordExpiry?: Date | null;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;

  // Instance method to compare passwords
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// If you want to add static methods to the User model, you can extend Model like this:
// import { Model } from 'mongoose';
// export interface IUserModel extends Model<IUser> {
//   // e.g. findByToken(token: string): Promise<IUser | null>;
// }
