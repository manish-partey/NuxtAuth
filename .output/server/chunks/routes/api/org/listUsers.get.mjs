import { d as defineEventHandler, i as requireRole, c as createError, O as Organization, U as User } from '../../../nitro/nitro.mjs';
import { c as connectToDatabase } from '../../../_/db.mjs';
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
import 'mongodb';

const listUsers_get = defineEventHandler(async (event) => {
  try {
    await connectToDatabase();
    await requireRole(event, ["super_admin", "platform_admin", "organization_admin"]);
    const url = new URL(event.req.url, `http://${event.req.headers.host}`);
    const organizationId = url.searchParams.get("organizationId");
    const user = event.context.user;
    if (organizationId) {
      if (user.role === "organization_admin" && user.organizationId !== organizationId) {
        throw createError({
          statusCode: 403,
          statusMessage: "Forbidden: Not admin of this organization"
        });
      }
      if (user.role === "platform_admin") {
        const org = await Organization.findById(organizationId);
        if (!org || org.platformId.toString() !== user.platformId) {
          throw createError({
            statusCode: 403,
            statusMessage: "Forbidden: Not authorized for this organization"
          });
        }
      }
      const users2 = await User.find({ organizationId }).select("-password -verificationToken -verificationTokenExpiry").lean();
      return { success: true, users: users2 };
    }
    let filter = {};
    if (user.role === "platform_admin") {
      filter.platformId = user.platformId;
    }
    const users = await User.find(filter).select("-password -verificationToken -verificationTokenExpiry").lean();
    return { success: true, users };
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});

export { listUsers_get as default };
//# sourceMappingURL=listUsers.get.mjs.map
