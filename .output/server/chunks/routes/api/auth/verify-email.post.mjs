import { c as defineEventHandler, r as readBody, e as createError } from '../../../_/nitro.mjs';
import { U as User } from '../../../_/User.mjs';
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

const verifyEmail_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { token } = body;
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: "Verification token is required." });
  }
  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    });
    if (!user) {
      throw createError({ statusCode: 400, statusMessage: "Invalid or expired verification token." });
    }
    user.isVerified = true;
    user.verificationToken = void 0;
    user.verificationTokenExpiry = void 0;
    await user.save();
    return { message: "Email verified successfully! You can now log in." };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    throw createError({ statusCode: 500, statusMessage: "Internal server error.", data: error.message });
  }
});

export { verifyEmail_post as default };
//# sourceMappingURL=verify-email.post.mjs.map
