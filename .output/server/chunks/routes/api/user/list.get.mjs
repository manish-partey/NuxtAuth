import { d as defineEventHandler, i as requireRole, U as User, c as createError } from '../../../nitro/nitro.mjs';
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

const list_get = defineEventHandler(async (event) => {
  var _a;
  try {
    await requireRole(event, ["super_admin", "platform_admin", "organization_admin"]);
    const url = new URL(event.req.url, `http://${event.req.headers.host}`);
    const organizationId = url.searchParams.get("organizationId");
    const currentUser = event.context.user;
    const query = {};
    if (organizationId) {
      query.organizationId = organizationId;
    }
    if (currentUser.role === "organization_admin") {
      query.organizationId = currentUser.organizationId;
    }
    const users = await User.find(query).select("_id name email role organizationId").populate("organizationId", "name _id").lean();
    const formatted = users.map((user) => {
      var _a2, _b;
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organizationId && typeof user.organizationId === "object" ? {
          _id: ((_b = (_a2 = user.organizationId._id) == null ? void 0 : _a2.toString) == null ? void 0 : _b.call(_a2)) || "",
          name: user.organizationId.name || "N/A"
        } : null
      };
    });
    return { success: true, users: formatted };
  } catch (err) {
    if (typeof ((_a = defaultClient) == null ? void 0 : _a.trackException) === "function") {
      defaultClient.trackException({ exception: err });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Server Error",
      message: "Failed to load users"
    });
  }
});

export { list_get as default };
//# sourceMappingURL=list.get.mjs.map
