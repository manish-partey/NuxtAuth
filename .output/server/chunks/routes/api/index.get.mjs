import { d as defineEventHandler, e as getUserFromEvent, c as createError, k as getQuery, U as User } from '../../nitro/nitro.mjs';
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

const index_get = defineEventHandler(async (event) => {
  try {
    try {
      const user = await getUserFromEvent(event);
      const allowedRoles = ["admin", "super_admin", "platform-admin", "organization-admin"];
      if (!user || !allowedRoles.includes(user.role)) {
        console.warn("Forbidden access attempt by:", (user == null ? void 0 : user.email) || "unauthenticated user");
        throw createError({ statusCode: 403, statusMessage: "Forbidden: Admin access required." });
      }
      const query = getQuery(event);
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 20;
      const skip = (page - 1) * limit;
      const totalUsers = await User.countDocuments();
      const users = await User.find({}, "username name email role isVerified").skip(skip).limit(limit).lean();
      return {
        page,
        limit,
        total: totalUsers,
        users: users.map((u) => ({
          id: u._id.toString(),
          username: u.username,
          name: u.name,
          email: u.email,
          role: u.role,
          isVerified: u.isVerified
        }))
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error == null ? void 0 : error.statusCode) throw error;
      throw createError({
        statusCode: 500,
        statusMessage: "Internal server error.",
        data: error.message || "Unexpected server error."
      });
    }
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
