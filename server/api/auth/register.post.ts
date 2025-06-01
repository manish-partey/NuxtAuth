// server/api/auth/register.post.ts
import User from '../../models/User';
import { generateAuthToken } from '../../utils/auth';
import { sendEmail } from '../../utils/mail';
import { v4 as uuidv4 } from 'uuid';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, name, email, password } = body;

  const role = "user"; // Hardcoded role for all registrations
  const config = useRuntimeConfig();

  if (!username || !name || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'All fields are required.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError({ statusCode: 409, statusMessage: 'Email already registered.' });
    }

    console.log("Assigned role:", role); // Debug log to verify role assignment

    const verificationToken = uuidv4();
    const verificationTokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiry

    const user = new User({
      username,
      name,
      email,
      password,
      role, // Hardcoded role is now included
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

    return { message: 'Registration successful. Please check your email to verify your account.' };

  } catch (error: any) {
    console.error('Validation Error:', error.errors);
    throw createError({ statusCode: 500, statusMessage: 'Internal server error.', data: error.message });
  }
});
