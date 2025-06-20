import { setCookie, createError, readBody, defineEventHandler } from 'h3';
import User from '../../models/User';
import { generateAuthToken } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as { email?: string; password?: string };
  const { email, password } = body;

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid credentials.' });
    }

    if (!user.isVerified) {
      throw createError({ statusCode: 403, statusMessage: 'Please verify your email address.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid credentials.' });
    }

    const token = generateAuthToken(
      user._id.toString(),
      user.role,
      user.organizationId?.toString(),
      user.platformId?.toString() // Add platformId if applicable
    );

    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax',
    });

    return {
      message: 'Login successful!',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId?.toString() || null,
        platformId: user.platformId?.toString() || null,
      },
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error.',
      data: error.message,
    });
  }
});
