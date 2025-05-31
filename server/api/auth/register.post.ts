// server/api/auth/register.post.ts
import User from '../../models/User';
import { generateAuthToken } from '../../utils/auth';
import { sendEmail } from '../../utils/mail';
import { v4 as uuidv4 } from 'uuid';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, email, password } = body;
  const config = useRuntimeConfig();

  if (!name || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'All fields are required.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError({ statusCode: 409, statusMessage: 'Email already registered.' });
    }

    const verificationToken = uuidv4();
    const verificationTokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiry

    const user = new User({
      name,
      email,
      password,
      isVerified: false,
      verificationToken,
      verificationTokenExpiry,
    });
    await user.save();

    const verificationLink = `${config.public.appUrl}/verify-email?token=${verificationToken}`;
    await sendEmail(
      user.email,
      'Verify your email for Nuxt Auth App',
      `Please click this link to verify your email: <a href="${verificationLink}">${verificationLink}</a>`
    );

    // Don't send token on registration until email is verified
    return { message: 'Registration successful. Please check your email to verify your account.' };

  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal server error.', data: error.message });
  }
});