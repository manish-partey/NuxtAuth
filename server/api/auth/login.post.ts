// server/api/auth/login.post.ts
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

    const token = generateAuthToken(user._id.toString(), user.role);

    // Set token as a cookie (secure and httpOnly for extra security)
    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return { message: 'Login successful!', user: { id: user._id, name: user.name, email: user.email, role: user.role } };

  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal server error.', data: error.message });
  }
});