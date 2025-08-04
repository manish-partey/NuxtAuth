import { d as defineEventHandler, r as readBody, e as getUserFromEvent, h as sendError, c as createError } from '../../../../nitro/nitro.mjs';
import { I as Invitation } from '../../../../_/Invitation2.mjs';
import { c as connectToDatabase } from '../../../../_/db.mjs';
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
import 'mongodb';

const revoke_post = defineEventHandler(async (event) => {
  try {
    const { inviteId } = await readBody(event);
    const user = await getUserFromEvent(event);
    if (!user) {
      return sendError(event, createError({ statusCode: 401, message: "Unauthorized" }));
    }
    await connectToDatabase();
    const invite = await Invitation.findById(inviteId);
    if (!invite) {
      return sendError(event, createError({ statusCode: 404, message: "Invite not found" }));
    }
    if (invite.status !== "pending") {
      return sendError(event, createError({ statusCode: 400, message: "Only pending invites can be revoked" }));
    }
    invite.status = "expired";
    await invite.save();
    return { success: true };
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});

export { revoke_post as default };
//# sourceMappingURL=revoke.post.mjs.map
