import { c as defineEventHandler, r as readBody, u as useRuntimeConfig, e as createError } from '../../../_/nitro.mjs';
import { U as User } from '../../../_/User.mjs';
import { s as sendEmail } from '../../../_/mail.mjs';
import { v4 } from 'uuid';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import 'node:url';
import 'bcryptjs';
import 'nodemailer';

const register_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, name, email, password } = body;
  const role = "user";
  const config = useRuntimeConfig();
  if (!username || !name || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: "All fields are required." });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError({ statusCode: 409, statusMessage: "Email already registered." });
    }
    console.log("Assigned role:", role);
    const verificationToken = v4();
    const verificationTokenExpiry = new Date(Date.now() + 36e5);
    const user = new User({
      username,
      name,
      email,
      password,
      role,
      // Hardcoded role is now included
      isVerified: false,
      verificationToken,
      verificationTokenExpiry
    });
    await user.save();
    const verificationLink = `${config.public.appUrl}/verify-email?token=${verificationToken}`;
    const emailHtml = `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2 style="color: #3b82f6;">Welcome to Nuxt Auth App!</h2>
    <p>Hi ${user.name || "there"},</p>
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
      "Verify Your Email \u2013 Nuxt Auth App",
      emailHtml
    );
    return { message: "Registration successful. Please check your email to verify your account." };
  } catch (error) {
    console.error("Validation Error:", error.errors);
    throw createError({ statusCode: 500, statusMessage: "Internal server error.", data: error.message });
  }
});

export { register_post as default };
//# sourceMappingURL=register.post.mjs.map
