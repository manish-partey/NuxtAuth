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
    const emailHtml = `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2 style="color: #3b82f6;">Welcome to Nuxt Auth App!</h2>
    <p>Hi ${user.name || 'there'},</p>
    <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
    <p style="margin: 30px 0;">
      <a href="${verificationLink}" style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
        Verify Email
      </a>
    </p>
    <p>This link will expire in 1 hour. If you did not sign up, you can safely ignore this email.</p>
    <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
    <p style="font-size: 12px; color: #777;">Best regards,<br>The Nuxt Auth App Team</p>
  </div>
`;

    await sendEmail(
      user.email,
      'Verify Your Email – Nuxt Auth App',
      emailHtml
    );


    return { message: 'Registration successful. Please check your email to verify your account.' };

  } catch (error: any) {
    console.error('Validation Error:', error.errors);
    throw createError({ statusCode: 500, statusMessage: 'Internal server error.', data: error.message });
  }
});
