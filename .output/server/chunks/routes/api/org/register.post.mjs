import { d as defineEventHandler, r as readBody, O as Organization, c as createError, U as User, u as useRuntimeConfig } from '../../../nitro/nitro.mjs';
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
    const { orgName, orgDomain, adminName, adminEmail, adminPassword } = body;
    const existingOrg = await Organization.findOne({ domain: orgDomain });
    if (existingOrg) throw createError({ statusCode: 409, statusMessage: "Organization already exists" });
    const newOrg = await Organization.create({ name: orgName, domain: orgDomain });
    const verificationToken = v4();
    const adminUser = new User({
      username: adminEmail.split("@")[0],
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      organizationId: newOrg._id,
      verificationToken,
      verificationTokenExpiry: new Date(Date.now() + 36e5)
    });
    await adminUser.save();
    const config = useRuntimeConfig();
    const verificationLink = `${config.public.appUrl}/verify-email?token=${verificationToken}`;
    const emailHtml = `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2 style="color: #3b82f6;">EaseMyCargo App \u2013 Email Verification</h2>
    <p>Hello ${adminUser.name || "Admin"},</p>
    <p>Your organization was successfully registered. Please verify your email address to activate your admin account by clicking the button below:</p>
    <p style="margin: 30px 0;">
      <a href="${verificationLink}" style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
        Verify Email
      </a>
    </p>
    <p>This link will expire in 1 hour. If you didn\u2019t register, you can safely ignore this email.</p>
    <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
    <p style="font-size: 12px; color: #777;">Thank you,<br>The EaseMyCargo App Team</p>
  </div>
`;
    await sendEmail(
      adminUser.email,
      "Verify Your Email \u2013 EaseMyCargo App",
      emailHtml
    );
    return { message: "Organization and admin registered successfully" };
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});

export { register_post as default };
//# sourceMappingURL=register.post.mjs.map
