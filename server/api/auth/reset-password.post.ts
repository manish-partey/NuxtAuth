// server/api/auth/reset-password.post.ts
import { defineEventHandler, createError, readBody } from 'h3'
import User from '../../models/User';


export default defineEventHandler(async (event) => {
  try {
  const body = await readBody(event);
  const { token, newPassword } = body;

  if (!token || !newPassword) {
    throw createError({ statusCode: 400, statusMessage: 'Token and new password are required.' });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid or expired password reset token.' });
    }

    user.password = newPassword; // Mongoose pre-save hook will hash this
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    user.isVerified = true; // Mark user as verified when they set their password
    await user.save();

    return { message: 'Password has been reset successfully. You can now log in with your new password.' };

  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal server error.', data: error.message });
  }
  } catch (err) {
    throw err;
  }
});