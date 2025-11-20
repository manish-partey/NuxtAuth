// server/services/auth.ts
import User from '~/server/models/User';
import bcrypt from 'bcryptjs';

/**
 * Simplified authentication service - only handles login/auth verification
 * User creation/registration moved to user.ts service
 */

/**
 * Login using email or username
 */
export async function loginUser(emailOrUsername: string, password: string) {
  const user = await User.findOne({ 
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }] 
  });
  
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // Return user without password
  const safeUser = user.toObject();
  delete safeUser.password;
  return safeUser;
}

/**
 * Verify password for existing user (for password changes, etc.)
 */
export async function verifyUserPassword(userId: string, password: string): Promise<boolean> {
  const user = await User.findById(userId).select('+password');
  if (!user) return false;
  
  return bcrypt.compare(password, user.password);
}

/**
 * Change user password
 */
export async function changeUserPassword(userId: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(userId, { password: hashedPassword });
  return true;
}
