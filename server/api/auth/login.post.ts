// server/api/auth/login.post.ts
import { setCookie } from 'h3';
import User from '../../models/User';
import { generateAuthToken } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
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

    // ✅ Include organizationId in the token
    const token = generateAuthToken(
      user._id.toString(),
      user.role,
      user.organizationId?.toString()
    );

    // ✅ Set token as cookie for SSR access
    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return {
      message: 'Login successful!',
      token, // optional
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId?.toString() || null
      }
    };

  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error.',
      data: error.message
    });
  }
});
