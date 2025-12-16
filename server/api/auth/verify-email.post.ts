// server/api/auth/verify-email.post.ts
import User from '../../models/User';


export default defineEventHandler(async (event) => {
  try {
  const body = await readBody(event);
  const { token } = body;

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Verification token is required.' });
  }

  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid or expired verification token.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    return { message: 'Email verified successfully! You can now log in.' };

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