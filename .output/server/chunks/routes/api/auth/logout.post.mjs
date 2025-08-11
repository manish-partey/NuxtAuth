import { d as defineEventHandler, a as deleteCookie } from '../../../nitro/nitro.mjs';
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

const logout_post = defineEventHandler(async (event) => {
  try {
    deleteCookie(event, "auth_token", { path: "/" });
    return { message: "Logged out successfully." };
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});

export { logout_post as default };
//# sourceMappingURL=logout.post.mjs.map
