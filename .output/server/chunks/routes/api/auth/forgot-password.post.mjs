import { d as defineEventHandler, r as readBody, u as useRuntimeConfig, c as createError, U as User } from '../../../nitro/nitro.mjs';
import { s as sendEmail } from '../../../_/mail.mjs';
import { v4 } from 'uuid';
import { defaultClient } from 'applicationinsights';
import 'mongoose';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'jsonwebtoken';
import 'bcryptjs';
import 'nodemailer';

const forgotPassword_post = defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { email } = body;
    const config = useRuntimeConfig();
    if (!email) {
      throw createError({ statusCode: 400, statusMessage: "Email is required." });
    }
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return { message: "If an account with that email exists, a password reset link has been sent." };
      }
      const resetToken = v4();
      const resetTokenExpiry = new Date(Date.now() + 36e5);
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpiry = resetTokenExpiry;
      await user.save();
      const resetLink = `${config.public.appUrl}/reset-password?token=${resetToken}`;
      const emailHtml = `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2 style="color: #3b82f6;">EaseMyCargo App \u2013 Password Reset</h2>
    <p>Hello ${user.name || "User"},</p>
    <p>You recently requested to reset your password. Please click the button below to proceed:</p>
    <p style="margin: 30px 0;">
      <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
        Reset Password
      </a>
    </p>
    <p>This link will expire in 1 hour. If you did not request a password reset, please ignore this email or contact support.</p>
    <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
    <p style="font-size: 12px; color: #777;">Thank you,<br>EaseMyCargo App Team</p>
  </div>
`;
      await sendEmail(
        user.email,
        "Reset Your Password \u2013 EaseMyCargo App",
        emailHtml
      );
      return { message: "If an account with that email exists, a password reset link has been sent." };
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw createError({ statusCode: 500, statusMessage: "Internal server error.", data: error.message });
    }
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});

export { forgotPassword_post as default };
//# sourceMappingURL=forgot-password.post.mjs.map
