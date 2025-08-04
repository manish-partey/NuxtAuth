import { d as defineEventHandler, i as requireRole, e as getUserFromEvent, c as createError, r as readBody, U as User } from '../../../nitro/nitro.mjs';
import { z } from 'zod';
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

const updateSchema = z.object({
  userId: z.string(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(["super_admin", "platform_admin", "organization_admin", "user"]).optional(),
  disabled: z.boolean().optional()
});
const update_post = defineEventHandler(async (event) => {
  var _a, _b;
  try {
    await requireRole(event, ["super_admin", "platform_admin", "organization_admin", "user"]);
    const currentUser = await getUserFromEvent(event);
    console.log("[DEBUG] currentUser:", currentUser);
    if (!currentUser || !currentUser.role) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }
    const body = await readBody(event);
    const { userId, name, email, role, disabled } = updateSchema.parse(body);
    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }
    const currentUserId = ((_b = (_a = currentUser._id) == null ? void 0 : _a.toString) == null ? void 0 : _b.call(_a)) || currentUser.id || null;
    const isSelf = currentUserId && userId === currentUserId;
    if (isSelf) {
      if (role && role !== currentUser.role) {
        throw createError({ statusCode: 400, statusMessage: "You cannot change your own role" });
      }
      if (disabled === true) {
        throw createError({ statusCode: 400, statusMessage: "You cannot disable your own account" });
      }
    }
    let sameOrg = false;
    if (userToUpdate.organizationId && currentUser.organizationId) {
      sameOrg = userToUpdate.organizationId.toString() === currentUser.organizationId.toString();
    }
    switch (currentUser.role) {
      case "super_admin":
        break;
      case "platform_admin":
        if (userToUpdate.role === "super_admin") {
          throw createError({ statusCode: 403, statusMessage: "Cannot update Super Admins" });
        }
        break;
      case "organization_admin":
        if (!sameOrg) {
          throw createError({ statusCode: 403, statusMessage: "Cannot update users outside your organization" });
        }
        if (role && !["organization_admin", "user"].includes(role)) {
          throw createError({ statusCode: 403, statusMessage: "Cannot assign elevated roles" });
        }
        break;
      case "user":
        if (!isSelf) {
          throw createError({ statusCode: 403, statusMessage: "Users can only update their own profile" });
        }
        if (role || disabled !== void 0) {
          throw createError({ statusCode: 403, statusMessage: "Users cannot change role or status" });
        }
        break;
    }
    if (name) userToUpdate.name = name;
    if (email) userToUpdate.email = email;
    if (role) userToUpdate.role = role;
    if (disabled !== void 0) userToUpdate.disabled = disabled;
    await userToUpdate.save();
    return { success: true, user: userToUpdate };
  } catch (err) {
    console.error("[ERROR] User update failed:", err);
    throw createError({
      statusCode: 500,
      statusMessage: (err == null ? void 0 : err.message) || "User update failed"
    });
  }
});

export { update_post as default };
//# sourceMappingURL=update.post.mjs.map
