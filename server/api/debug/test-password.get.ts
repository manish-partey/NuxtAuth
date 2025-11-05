// server/api/debug/test-password.get.ts
import User from '~/server/models/User';
import bcrypt from 'bcryptjs';

export default defineEventHandler(async (event) => {
  try {
    // Find the first user
    const user = await User.findOne({}).limit(1);

    if (!user) {
      return {
        message: 'No users found',
      };
    }

    console.log(`[DEBUG] User: ${user.email}`);
    console.log(`[DEBUG] Password hash from DB: ${user.password}`);
    console.log(`[DEBUG] Is password hashed? ${user.password.startsWith('$2')}`);

    // Test password comparison
    const testPassword = 'TestPassword123'; // Test with a known password
    const isMatch = await user.comparePassword(testPassword);

    return {
      email: user.email,
      passwordIsHashed: user.password.startsWith('$2'),
      passwordHash: user.password.substring(0, 50) + '...',
      testPasswordMatch: isMatch,
      isVerified: user.isVerified,
      role: user.role,
    };
  } catch (err: any) {
    console.error('[DEBUG] Error:', err);
    return { error: err.message };
  }
});
