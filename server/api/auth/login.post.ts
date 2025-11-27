// server/api/auth/login.post.ts

import { setCookie, getCookie, createError, readBody, defineEventHandler } from 'h3';
import User from '../../models/User';
import { generateAuthToken, setSessionCookie } from '../../utils/auth';
import { compareSync } from 'bcryptjs';

export default defineEventHandler(async (event) => {
  try {
    console.log('[LOGIN] Received login request');
    const body = await readBody(event) as { email?: string; password?: string };
    let { email, password } = body;

    // Trim whitespace
    email = email?.trim().toLowerCase();
    password = password?.trim();

    console.log(`[LOGIN] Email: ${email}, Password length: ${password?.length}`);

    if (!email || !password) {
      throw createError({ statusCode: 400, statusMessage: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      console.error(`[LOGIN] User not found with email: ${email}`);
      throw createError({ statusCode: 401, statusMessage: 'Invalid credentials.' });
    }

    console.log(`[LOGIN] User found: ${user.email}, isVerified: ${user.isVerified}, role: ${user.role}`);

    if (!user.isVerified) {
      console.error(`[LOGIN] User not verified: ${email}`);
      throw createError({ statusCode: 403, statusMessage: 'Please verify your email address.' });
    }

    // Use bcrypt to compare passwords
    console.log(`[LOGIN] Comparing passwords for user: ${email}`);
    const isMatch = await user.comparePassword(password);
    console.log(`[LOGIN] Password match result: ${isMatch}`);
    
    if (!isMatch) {
      console.error(`[LOGIN] Password mismatch for user: ${email}`);
      throw createError({ statusCode: 401, statusMessage: 'Invalid credentials.' });
    }

    const token = await generateAuthToken(
      user._id.toString(),
      user.role,
      user.organizationId?.toString(),
      user.platformId?.toString()
    );

    // Set token as a cookie (secure and httpOnly for extra security)
    console.log(`[LOGIN] Setting auth_token cookie for user: ${email}`);
    setSessionCookie(event, token);

    console.log(`[LOGIN] Cookie set successfully for user: ${email}`);
    
    // Verify cookie was set by reading it back
    const verificationCookie = getCookie(event, 'auth_token');
    console.log(`[LOGIN] Cookie verification - set: ${verificationCookie ? 'SUCCESS' : 'FAILED'}`);
    
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
      token: token, // Include token for frontend state management
      success: true
    };
    
  } catch (err: any) {
    
    // ✅ Safe usage of application insights
    
    console.error('[LOGIN] Error:', err);
    
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
