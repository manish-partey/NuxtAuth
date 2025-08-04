import { d as defineEventHandler, r as readBody, u as useRuntimeConfig, c as createError, U as User } from '../../../nitro/nitro.mjs';
import { v4 } from 'uuid';
import { s as sendEmail } from '../../../_/mail.mjs';
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

const register_post = defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const config = useRuntimeConfig();
    const username = (body.username || "").trim().toLowerCase();
    const name = (body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password;
    if (!username || !name || !email || !password) {
      throw createError({ statusCode: 400, statusMessage: "All fields are required." });
    }
    try {
      const existing = await User.findOne({ $or: [{ email }, { username }] });
      if (existing) {
        throw createError({ statusCode: 409, statusMessage: "Email or username already exists." });
      }
      const verificationToken = v4();
      const expiry = new Date(Date.now() + 1e3 * 60 * 60);
      const newUser = new User({
        username,
        name,
        email,
        password,
        role: "user",
        isVerified: false,
        verificationToken,
        verificationTokenExpiry: expiry,
        isVerificationTokenUsed: false,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
        platformId: null,
        // ✅ Fix: required to satisfy schema
        organizationId: null
        // ✅ Fix: required to satisfy schema
      });
      console.log("\u{1F4E6} About to save user:", newUser.toObject());
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
      await sendEmail(email, "Verify Your Email \u2013 EaseMyCargo", emailHtml);
      return {
        message: "Registration successful. Please check your email to verify your account."
      };
    } catch (err) {
      console.error("\u274C Registration Error:", err);
      if (err.statusCode) {
        throw createError({ statusCode: err.statusCode, statusMessage: err.statusMessage });
      }
      if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message).join(", ");
        throw createError({ statusCode: 400, statusMessage: `Validation failed: ${messages}` });
      }
      throw createError({ statusCode: 500, statusMessage: "Registration failed.", data: err.message });
    }
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});

export { register_post as default };
//# sourceMappingURL=register.post.mjs.map
