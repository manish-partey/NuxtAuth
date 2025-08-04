import { d as defineEventHandler, i as requireRole, r as readBody } from '../../../nitro/nitro.mjs';
import { r as removePlatformAdmin } from '../../../_/platform2.mjs';
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

const removeAdmin_post = defineEventHandler(async (event) => {
  try {
    await requireRole(["super_admin", "platform_admin"])(event);
    const body = await readBody(event);
    const { platformId, userId } = body;
    if (!platformId || !userId) {
      return { success: false, message: "platformId and userId are required" };
    }
    try {
      const removedUser = await removePlatformAdmin(platformId, userId, event.context.user.id);
      return { success: true, user: removedUser };
    } catch (err) {
      return { success: false, message: err.message };
    }
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});

export { removeAdmin_post as default };
//# sourceMappingURL=removeAdmin.post.mjs.map
