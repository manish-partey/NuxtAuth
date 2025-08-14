// server/api/auth/register.post.ts

import { readBody, createError, defineEventHandler } from 'h3';
import User from '~/server/models/User';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '~/server/utils/mail';

export default defineEventHandler(async (event) => {
  try {
  const body = await readBody(event);
  const config = useRuntimeConfig();

  const username = (body.username || '').trim().toLowerCase();
  const name = (body.name || '').trim();
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password;

  if (!username || !name || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'All fields are required.' });
  }

  try {
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      // Check specifically for email duplicate
      if (existing.email === email) {
        throw createError({ statusCode: 409, statusMessage: 'Email already registered. Please use a different email or try logging in.' });
      }
      throw createError({ statusCode: 409, statusMessage: 'Email or username already exists.' });
    }

    const verificationToken = uuidv4();
    const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    const newUser = new User({
      username,
      name,
      email,
      password,
      role: 'user',
      isVerified: false,
      verificationToken,
      verificationTokenExpiry: expiry,
      isVerificationTokenUsed: false,
      resetPasswordToken: null,
      resetPasswordExpiry: null,
      platformId: null,         // ✅ Fix: required to satisfy schema
      organizationId: null,     // ✅ Fix: required to satisfy schema
    });

    console.log('📦 About to save user:', newUser.toObject());

    await newUser.save();

    const link = `${config.public.appUrl}/verify-email?token=${verificationToken}`;
    const emailHtml = `
      <div style="font-family: Arial; padding: 20px;">
        <h2 style="color:#3b82f6">Welcome to EaseMyCargo!</h2>
        <p>Hello ${newUser.name},</p>
        <p>Please verify your email by clicking the button below:</p>
        <p><a href="${link}" style="background:#22c55e; color:white; padding:10px 20px; text-decoration:none;">Verify Email</a></p>
        <p>This link expires in 1 hour.</p>
      </div>
    `;

    await sendEmail(email, 'Verify Your Email – EaseMyCargo', emailHtml);

    return {
      message: 'Registration successful. Please check your email to verify your account.'
    };
  } catch (err: any) {
    console.error('❌ Registration Error:', err);

    if (err.statusCode) {
      throw createError({ statusCode: err.statusCode, statusMessage: err.statusMessage });
    }

    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e: any) => e.message).join(', ');
      throw createError({ statusCode: 400, statusMessage: `Validation failed: ${messages}` });
    }

    throw createError({ statusCode: 500, statusMessage: 'Registration failed.', data: err.message });
  }
  } catch (err) {
    console.error('❌ Outer catch error:', err);
    throw err;
  }
});
