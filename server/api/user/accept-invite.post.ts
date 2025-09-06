// server/api/user/accept-invite.post.ts

import { connectToDatabase } from '~/server/utils/db';
import bcrypt from 'bcryptjs';
import { readBody, createError } from 'h3';
import { validateInviteToken, markInviteAccepted } from '~/server/services/invitation';
import User from '~/server/models/User';

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();

    const body = await readBody(event);
    const { token, name, password } = body;

    if (!token || !name || !password) {
      throw createError({ statusCode: 400, statusMessage: 'All fields are required.' });
    }

    const invite = await validateInviteToken(token.trim());
    if (!invite) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid or expired invitation.' });
    }

    const existingUser = await User.findOne({ email: invite.email });
    if (existingUser) {
      throw createError({ statusCode: 400, statusMessage: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    await User.create({
      email: invite.email,
      name: name.trim(),
      password: hashedPassword,
      username: invite.email.split('@')[0], // ✅ auto-generate username from email
      role: invite.role,
      organizationId: invite.organizationId,
      platformId: invite.platformId,
      invited: false,      // Mark user as no longer invited
      isVerified: true,    // Optional: auto-verify on invite flow
    });

    await markInviteAccepted(token.trim());

    return { success: true, message: 'Account created. You can now log in.' };
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to accept invite',
      data: err.message || 'Unknown error',
    });
  }
});
