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

const resetPassword_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { token, newPassword } = body;
  if (!token || !newPassword) {
    throw createError({ statusCode: 400, statusMessage: "Token and new password are required." });
  }
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });
    if (!user) {
      throw createError({ statusCode: 400, statusMessage: "Invalid or expired password reset token." });
    }
    user.password = newPassword;
    user.resetPasswordToken = void 0;
    user.resetPasswordExpiry = void 0;
    await user.save();
    return { message: "Password has been reset successfully. You can now log in with your new password." };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    throw createError({ statusCode: 500, statusMessage: "Internal server error.", data: error.message });
  }
});

export { resetPassword_post as default };
//# sourceMappingURL=reset-password.post.mjs.map
