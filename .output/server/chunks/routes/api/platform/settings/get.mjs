import { d as defineEventHandler, e as getUserFromEvent, c as createError } from '../../../../nitro/nitro.mjs';
import { P as Platform } from '../../../../_/Platform.mjs';
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

const get = defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event);
  if (!user || user.role !== "platform_admin") {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }
  try {
    if (!user.platformId) {
      throw createError({ statusCode: 400, statusMessage: "Missing platformId on user" });
    }
    const platform = await Platform.findById(user.platformId).lean();
    if (!platform) {
      throw createError({ statusCode: 404, statusMessage: "Platform not found" });
    }
    return {
      success: true,
      settings: {
        name: platform.name || "",
        slug: platform.slug || "",
        description: platform.description || "",
        status: platform.status || "inactive",
        createdAt: platform.createdAt,
        updatedAt: platform.updatedAt
      }
    };
  } catch (err) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch platform settings",
      data: err.message
    });
  }
});

export { get as default };
//# sourceMappingURL=get.mjs.map
