import { c as defineEventHandler, r as readBody, e as createError, f as setCookie } from '../../../_/nitro.mjs';
import { U as User } from '../../../_/User.mjs';
import { g as generateAuthToken } from '../../../_/auth.mjs';
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

const login_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body;
  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: "Email and password are required." });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Invalid credentials." });
    }
    if (!user.isVerified) {
      throw createError({ statusCode: 403, statusMessage: "Please verify your email address." });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw createError({ statusCode: 401, statusMessage: "Invalid credentials." });
    }
    const token = generateAuthToken(user._id.toString(), user.role);
    setCookie(event, "auth_token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 7,
      // 1 week
      path: "/"
    });
    return { message: "Login successful!", user: { id: user._id, name: user.name, email: user.email, role: user.role } };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    throw createError({ statusCode: 500, statusMessage: "Internal server error.", data: error.message });
  }
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map
