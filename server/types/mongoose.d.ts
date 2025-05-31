// server/types/mongoose.d.ts

import { Document } from 'mongoose';

// Declare a custom interface that extends mongoose.Document
// and includes your custom methods and properties that you might add.
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // password might be optional after hashing, or for specific queries
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  // Add your custom methods here
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

// You might also need to extend the Model if you add static methods
// import { Model } from 'mongoose';
// export interface IUserModel extends Model<IUser> {
//   // add any static methods here, e.g., findByToken: (token: string) => Promise<IUser | null>;
// }

// Declare the default Mongoose Document type globally if you want it to apply everywhere
// This is less common but can be useful for very large projects
// declare module 'mongoose' {
//   interface Document extends IUser {}
// }