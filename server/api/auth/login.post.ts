// server/api/auth/login.post.ts

import { setCookie, createError, readBody, defineEventHandler } from 'h3';
import User from '../../models/User';
import { generateAuthToken } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
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

    // 🔧 FIX: Auto-assign organizationId for organization_admin if missing
    let updatedUser = user;
    if (user.role === 'organization_admin' && !user.organizationId) {
      console.warn(`[LOGIN] Organization admin ${email} missing organizationId, attempting to fix...`);
      
      try {
        // Find organization where this user is a member or creator
        const Organization = (await import('../../models/Organization')).default;
        const organization = await Organization.findOne({
          $or: [
            { createdBy: user._id },
            { 'members.userId': user._id }
          ]
        });

        if (organization) {
          // Update user with organizationId
          await User.findByIdAndUpdate(user._id, {
            organizationId: organization._id
          });
          
          // Update local user object for token generation
          updatedUser = await User.findById(user._id);
          console.log(`[LOGIN] Fixed organizationId for ${email}: ${organization._id}`);
        } else {
          console.error(`[LOGIN] No organization found for admin ${email}`);
        }
      } catch (fixError) {
        console.error(`[LOGIN] Failed to fix organizationId for ${email}:`, fixError);
        // Continue with login even if fix fails
      }
    }

    const token = generateAuthToken(
      updatedUser._id.toString(),
      updatedUser.role,
      updatedUser.organizationId?.toString(),
      updatedUser.platformId?.toString()
    );

     // Set token as a cookie (secure and httpOnly for extra security)
    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    console.log(`[LOGIN] Token set for user: ${email}`);
    
    return {
      message: 'Login successful!',
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        organizationId: updatedUser.organizationId?.toString() || null,
        platformId: updatedUser.platformId?.toString() || null,
      },
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
