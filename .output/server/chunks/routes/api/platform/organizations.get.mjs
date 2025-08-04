import { d as defineEventHandler, i as requireRole, c as createError, O as Organization } from '../../../nitro/nitro.mjs';
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

const organizations_get = defineEventHandler(async (event) => {
  var _a;
  try {
    await requireRole(event, ["platform_admin"]);
    const currentUser = event.context.user;
    if (!(currentUser == null ? void 0 : currentUser.platformId)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing platformId in user context"
      });
    }
    const organizations = await Organization.find({
      platformId: currentUser.platformId
    }).select("_id name slug status createdAt").sort({ createdAt: -1 }).lean();
    return {
      success: true,
      organizations
    };
  } catch (err) {
    console.error("[API] /platform/organizations error:", err);
    if (typeof ((_a = defaultClient) == null ? void 0 : _a.trackException) === "function") {
      defaultClient.trackException({ exception: err });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to load organizations",
      data: err.message || "Unknown error"
    });
  }
});

export { organizations_get as default };
//# sourceMappingURL=organizations.get.mjs.map
