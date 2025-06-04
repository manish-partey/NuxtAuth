import { c as defineEventHandler, g as deleteCookie } from '../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import 'node:url';

const logout_post = defineEventHandler(async (event) => {
  deleteCookie(event, "auth_token", { path: "/" });
  return { message: "Logged out successfully." };
});

export { logout_post as default };
//# sourceMappingURL=logout.post.mjs.map
