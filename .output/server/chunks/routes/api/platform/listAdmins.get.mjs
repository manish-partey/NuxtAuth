import { d as defineEventHandler, i as requireRole, k as getQuery } from '../../../nitro/nitro.mjs';
import { l as listPlatformAdmins } from '../../../_/platform2.mjs';
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
import '../../../_/Platform.mjs';

const listAdmins_get = defineEventHandler(async (event) => {
  var _a;
  try {
    await requireRole(["super_admin", "platform_admin"])(event);
    const platformId = getQuery(event).platformId;
    if (!platformId) {
      return {
        success: false,
        message: "platformId query parameter is required"
      };
    }
    const platforms = await listPlatformAdmins(platformId);
    const formatted = platforms.map((platform) => ({
      _id: platform._id,
      name: platform.name,
      createdAt: platform.createdAt,
      admins: Array.isArray(platform.admins) ? platform.admins.map((admin) => ({ email: admin.email })) : []
    }));
    return {
      success: true,
      data: formatted
    };
  } catch (err) {
    if ((_a = defaultClient) == null ? void 0 : _a.trackException) {
      defaultClient.trackException({ exception: err });
    }
    return {
      success: false,
      message: (err == null ? void 0 : err.message) || "Failed to fetch platform admins."
    };
  }
});

export { listAdmins_get as default };
//# sourceMappingURL=listAdmins.get.mjs.map
