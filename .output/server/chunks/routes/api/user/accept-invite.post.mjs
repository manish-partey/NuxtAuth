import { d as defineEventHandler, r as readBody, c as createError, U as User } from '../../../nitro/nitro.mjs';
import { c as connectToDatabase } from '../../../_/db.mjs';
import bcrypt from 'bcryptjs';
import { v as validateInviteToken, m as markInviteAccepted } from '../../../_/invitation.mjs';
import 'mongoose';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'applicationinsights';
import 'node:url';
import 'jsonwebtoken';
import 'mongodb';
import '../../../_/Invitation2.mjs';
import 'crypto';
import '../../../_/mail.mjs';
import 'nodemailer';
import '../../../_/inviteUser.mjs';

let defaultClient = null;
try {
  const ai = require("applicationinsights");
  defaultClient = ai.defaultClient;
} catch (_) {
}
const acceptInvite_post = defineEventHandler(async (event) => {
  try {
    await connectToDatabase();
    const body = await readBody(event);
    const { token, name, password } = body;
    if (!token || !name || !password) {
      throw createError({ statusCode: 400, statusMessage: "All fields are required." });
    }
    const invite = await validateInviteToken(token.trim());
    if (!invite) {
      throw createError({ statusCode: 400, statusMessage: "Invalid or expired invitation." });
    }
    const existingUser = await User.findOne({ email: invite.email });
    if (existingUser) {
      throw createError({ statusCode: 400, statusMessage: "User already exists." });
    }
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    await User.create({
      email: invite.email,
      name: name.trim(),
      password: hashedPassword,
      username: invite.email.split("@")[0],
      // ✅ auto-generate username from email
      role: invite.role,
      organizationId: invite.organizationId,
      platformId: invite.platformId,
      invited: false,
      // Mark user as no longer invited
      isVerified: true
      // Optional: auto-verify on invite flow
    });
    await markInviteAccepted(token.trim());
    return { success: true, message: "Account created. You can now log in." };
  } catch (err) {
    if (typeof (defaultClient == null ? void 0 : defaultClient.trackException) === "function") {
      defaultClient.trackException({ exception: err });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to accept invite",
      data: err.message || "Unknown error"
    });
  }
});

export { acceptInvite_post as default };
//# sourceMappingURL=accept-invite.post.mjs.map
