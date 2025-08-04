import { d as defineEventHandler, r as readBody, e as getUserFromEvent, c as createError } from '../../../../nitro/nitro.mjs';
import { I as Invitation } from '../../../../_/Invitation2.mjs';
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

const revoke_post = defineEventHandler(async (event) => {
  var _a, _b;
  const { inviteId } = await readBody(event);
  const currentUser = await getUserFromEvent(event);
  if (!currentUser || currentUser.role !== "platform_admin") {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }
  const invite = await Invitation.findById(inviteId);
  if (!invite || ((_a = invite.platformId) == null ? void 0 : _a.toString()) !== ((_b = currentUser.platformId) == null ? void 0 : _b.toString())) {
    throw createError({ statusCode: 404, statusMessage: "Invite not found or unauthorized" });
  }
  invite.revoked = true;
  invite.status = "expired";
  await invite.save();
  return { success: true, message: "Invite revoked successfully." };
});

export { revoke_post as default };
//# sourceMappingURL=revoke.post.mjs.map
