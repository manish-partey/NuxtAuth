import { c as defineEventHandler, r as readBody, e as createError, u as useRuntimeConfig } from '../../../_/nitro.mjs';
import { U as User } from '../../../_/User.mjs';
import { a as getUserFromEvent } from '../../../_/auth.mjs';
import { v4 } from 'uuid';
import { s as sendEmail } from '../../../_/mail.mjs';
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
import 'jsonwebtoken';
import 'nodemailer';

const create_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, name, email, password, role } = body;
  const currentUser = await getUserFromEvent(event);
  if (!currentUser || currentUser.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Only admins can create users." });
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError({ statusCode: 409, statusMessage: "User already exists." });
  }
  const verificationToken = v4();
  const newUser = new User({
    username,
    // ✅ FIX: include the required field
    name,
    email,
    password,
    role,
    organizationId: currentUser.organizationId,
    verificationToken,
    verificationTokenExpiry: new Date(Date.now() + 36e5)
  });
  await newUser.save();
  const config = useRuntimeConfig();
  const verificationLink = `${config.public.appUrl}/verify-email?token=${verificationToken}`;
  const emailHtml = `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2 style="color: #3b82f6;">Your Account Has Been Created</h2>
    <p>Hello ${name || "User"},</p>
    <p>An account has been created for you in the <strong>Nuxt Auth App</strong>.</p>
    <p>To activate your account and set your password, please verify your email by clicking the button below:</p>
    <p style="margin: 30px 0;">
      <a href="${verificationLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
        Verify Email
      </a>
    </p>
    <p>This link will expire in 1 hour. If you were not expecting this, please ignore this email or contact support.</p>
    <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
    <p style="font-size: 12px; color: #777;">Best regards,<br>The Nuxt Auth App Team</p>
  </div>
`;
  await sendEmail(
    email,
    "Your Account Has Been Created \u2013 Verify Email",
    emailHtml
  );
  return { message: "User created and verification email sent." };
});

export { create_post as default };
//# sourceMappingURL=create.post.mjs.map
