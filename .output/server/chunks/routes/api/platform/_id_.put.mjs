import { d as defineEventHandler, e as getUserFromEvent, c as createError, r as readBody } from '../../../nitro/nitro.mjs';
import { P as Platform } from '../../../_/Platform.mjs';
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

const _id__put = defineEventHandler(async (event) => {
  var _a;
  try {
    const user = await getUserFromEvent(event);
    if (!user || user.role !== "super_admin") {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }
    const id = (_a = event.context.params) == null ? void 0 : _a.id;
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: "Missing platform ID" });
    }
    const { name, description } = await readBody(event);
    if (!name || typeof name !== "string" || !name.trim()) {
      throw createError({ statusCode: 400, statusMessage: "Platform name is required" });
    }
    const updated = await Platform.findByIdAndUpdate(
      id,
      { name: name.trim(), description: description || "" },
      { new: true }
    );
    if (!updated) {
      throw createError({ statusCode: 404, statusMessage: "Platform not found" });
    }
    return {
      success: true,
      platform: updated
    };
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});

export { _id__put as default };
//# sourceMappingURL=_id_.put.mjs.map
