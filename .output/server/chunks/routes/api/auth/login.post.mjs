import { d as defineEventHandler, r as readBody, c as createError, U as User, g as generateAuthToken, s as setCookie } from '../../../nitro/nitro.mjs';
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

const login_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e;
  try {
    const body = await readBody(event);
    const { email, password } = body;
    if (!email || !password) {
      throw createError({ statusCode: 400, statusMessage: "Email and password are required." });
    }
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
    const token = generateAuthToken(
      user._id.toString(),
      user.role,
      (_a = user.organizationId) == null ? void 0 : _a.toString(),
      (_b = user.platformId) == null ? void 0 : _b.toString()
    );
    setCookie(event, "auth_token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 7,
      // 1 week
      path: "/"
    });
    return {
      message: "Login successful!",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: ((_c = user.organizationId) == null ? void 0 : _c.toString()) || null,
        platformId: ((_d = user.platformId) == null ? void 0 : _d.toString()) || null
      }
    };
  } catch (err) {
    if (typeof ((_e = defaultClient) == null ? void 0 : _e.trackException) === "function") {
      defaultClient.trackException({ exception: err });
    }
    if (err.statusCode) {
      throw err;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error.",
      data: err.message
    });
  }
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map
