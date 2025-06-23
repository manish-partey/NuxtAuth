// server/api/auth/login.post.ts

import { setCookie, createError, readBody, defineEventHandler } from 'h3';
import User from '../../models/User';
import { generateAuthToken } from '../../utils/auth';
import { defaultClient } from 'applicationinsights';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event) as { email?: string; password?: string };
    const { email, password } = body;

    if (!email || !password) {
      throw createError({ statusCode: 400, statusMessage: 'Email and password are required.' });
    }

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
      user.platformId?.toString()
    );

    // ✅ Secure cookie setup
    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
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
  } catch (err: any) {
    // ✅ Safe usage of application insights
    if (typeof defaultClient?.trackException === 'function') {
      defaultClient.trackException({ exception: err });
    }

    if (err.statusCode) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error.',
      data: err.message,
    });
  }
});
