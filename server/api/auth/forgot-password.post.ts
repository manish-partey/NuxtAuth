// server/api/auth/forgot-password.post.ts
import User from '../../models/User';
import { sendEmail } from '../../utils/mail';
import { v4 as uuidv4 } from 'uuid';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email } = body;
  const config = useRuntimeConfig();

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Email is required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists for security reasons
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiry

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    const resetLink = `${config.public.appUrl}/reset-password?token=${resetToken}`;
    await sendEmail(
      user.email,
      'Password Reset Request for Nuxt Auth App',
      `You requested a password reset. Please click this link to reset your password: <a href="${resetLink}">${resetLink}</a>`
    );

    return { message: 'If an account with that email exists, a password reset link has been sent.' };

  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal server error.', data: error.message });
  }
});