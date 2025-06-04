import { c as defineEventHandler, e as createError } from '../../_/nitro.mjs';
import { U as User } from '../../_/User.mjs';
import { a as getUserFromEvent } from '../../_/auth.mjs';
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

const index_get = defineEventHandler(async (event) => {
  try {
    const user = await getUserFromEvent(event);
    if (!user || user.role !== "admin") {
      throw createError({ statusCode: 403, statusMessage: "Forbidden: Admin access required." });
    }
    const users = await User.find({}, "name email role isVerified");
    return { users: users.map((u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, isVerified: u.isVerified })) };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    throw createError({ statusCode: 500, statusMessage: "Internal server error.", data: error.message });
  }
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
