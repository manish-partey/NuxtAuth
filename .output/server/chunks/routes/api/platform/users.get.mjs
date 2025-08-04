import { d as defineEventHandler, e as getUserFromEvent, c as createError, U as User } from '../../../nitro/nitro.mjs';
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
import 'bcryptjs';

const users_get = defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event);
  if (!user || user.role !== "platform_admin") {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }
  try {
    const users = await User.find({ platformId: user.platformId }).select("-password").sort({ createdAt: -1 }).lean();
    return {
      success: true,
      data: users
    };
  } catch (err) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch platform users",
      data: err.message
    });
  }
});

export { users_get as default };
//# sourceMappingURL=users.get.mjs.map
