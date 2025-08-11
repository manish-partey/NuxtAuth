import { d as defineEventHandler, e as getUserFromEvent, c as createError } from '../../../nitro/nitro.mjs';
import { I as Invitation } from '../../../_/Invitation2.mjs';
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

const invites_get = defineEventHandler(async (event) => {
  const currentUser = await getUserFromEvent(event);
  if (!currentUser || currentUser.role !== "platform_admin") {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }
  const invites = await Invitation.find({
    platformId: currentUser.platformId,
    status: "pending",
    revoked: { $ne: true }
  }).sort({ createdAt: -1 });
  return { success: true, invites };
});

export { invites_get as default };
//# sourceMappingURL=invites.get.mjs.map
