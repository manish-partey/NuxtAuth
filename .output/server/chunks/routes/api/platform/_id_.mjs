import { d as defineEventHandler, e as getUserFromEvent, c as createError } from '../../../nitro/nitro.mjs';
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

const _id_ = defineEventHandler(async (event) => {
  var _a;
  try {
    const user = await getUserFromEvent(event);
    if (!user || user.role !== "super_admin") {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }
    const id = (_a = event.context.params) == null ? void 0 : _a.id;
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: "Platform ID is required" });
    }
    const platform = await Platform.findById(id).lean();
    if (!platform) {
      throw createError({ statusCode: 404, statusMessage: "Platform not found" });
    }
    return platform;
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});

export { _id_ as default };
//# sourceMappingURL=_id_.mjs.map
