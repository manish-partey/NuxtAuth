import { d as defineEventHandler, e as getUserFromEvent, c as createError, r as readBody } from '../../../../nitro/nitro.mjs';
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

const update_post = defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event);
  if (!user || user.role !== "platform_admin") {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }
  const body = await readBody(event);
  try {
    const platform = await Platform.findById(user.platformId);
    if (!platform) {
      throw createError({ statusCode: 404, statusMessage: "Platform not found" });
    }
    if (body.name !== void 0) platform.name = body.name;
    if (body.slug !== void 0) platform.slug = body.slug;
    if (body.description !== void 0) platform.description = body.description;
    if (body.status !== void 0) platform.status = body.status;
    await platform.save();
    return {
      success: true,
      message: "Platform settings updated successfully."
    };
  } catch (err) {
    console.error("[Platform Update Error]", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update platform settings.",
      data: err.message
    });
  }
});

export { update_post as default };
//# sourceMappingURL=update.post.mjs.map
