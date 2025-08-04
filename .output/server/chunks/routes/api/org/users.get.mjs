import { d as defineEventHandler, e as getUserFromEvent, c as createError, U as User } from '../../../nitro/nitro.mjs';
import { c as connectToDatabase } from '../../../_/db.mjs';
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
import 'mongodb';

const users_get = defineEventHandler(async (event) => {
  try {
    await connectToDatabase();
    const user = await getUserFromEvent(event);
    if (!user || user.role !== "organization_admin") {
      throw createError({ statusCode: 403, statusMessage: "Forbidden: Not authorized" });
    }
    const users = await User.find({
      organizationId: user.organizationId,
      role: { $in: ["user", "admin"] }
      // restrict to relevant roles
    }).select("_id name email role createdAt").sort({ createdAt: -1 }).lean();
    return { success: true, users };
  } catch (err) {
    console.error("[org/users.get] Error:", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch organization users",
      data: err instanceof Error ? err.message : String(err)
    });
  }
});

export { users_get as default };
//# sourceMappingURL=users.get.mjs.map
