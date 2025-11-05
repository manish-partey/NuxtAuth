// server/api/debug/reset-user-password.post.ts
import User from '~/server/models/User';
import bcrypt from 'bcryptjs';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event) as { email: string; newPassword: string };
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return { error: 'Email and newPassword are required' };
    }

    console.log(`[RESET-PASSWORD] Resetting password for: ${email}`);

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return { error: 'User not found', email };
    }

    // Set new password (the pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    console.log(`[RESET-PASSWORD] Password reset successfully for: ${email}`);
    console.log(`[RESET-PASSWORD] New password hash: ${user.password.substring(0, 40)}...`);

    // Test the new password
    const isMatch = await user.comparePassword(newPassword);
    console.log(`[RESET-PASSWORD] Password verification: ${isMatch}`);

    return {
      success: true,
      message: 'Password reset successfully',
      email: user.email,
      passwordVerified: isMatch,
      passwordHash: user.password.substring(0, 40) + '...',
    };
  } catch (err: any) {
    console.error('[RESET-PASSWORD] Error:', err);
    return { error: err.message };
  }
});
