import { d as defineEventHandler, i as requireRole, r as readBody } from '../../../nitro/nitro.mjs';
import { c as createPlatform } from '../../../_/platform2.mjs';
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

const create_post = defineEventHandler(async (event) => {
  try {
    try {
      await requireRole(event, ["super_admin"]);
      const body = await readBody(event);
      const { name, type } = body;
      if (!name || typeof name !== "string" || !name.trim()) {
        return { success: false, message: "Platform name is required" };
      }
      const allowedTypes = ["grocery", "college", "doctor", "hospital", "other"];
      if (!type || typeof type !== "string" || !allowedTypes.includes(type)) {
        return { success: false, message: "Valid platform type is required" };
      }
      const platform = await createPlatform({
        name: name.trim(),
        type,
        createdByUserId: event.context.user.id
      });
      return { success: true, platform };
    } catch (err) {
      return { success: false, message: err.message || "Failed to create platform" };
    }
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});

export { create_post as default };
//# sourceMappingURL=create.post.mjs.map
