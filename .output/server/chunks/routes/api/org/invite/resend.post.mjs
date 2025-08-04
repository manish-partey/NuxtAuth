import { d as defineEventHandler, r as readBody, e as getUserFromEvent, h as sendError, c as createError } from '../../../../nitro/nitro.mjs';
import { I as Invitation } from '../../../../_/Invitation2.mjs';
import { g as getDb, c as connectToDatabase } from '../../../../_/db.mjs';
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

const createInvite = async (invite) => {
  const db = getDb();
  return db.collection("invites").insertOne(invite);
};
const createAndSendInvite = async (invite) => {
  await createInvite(invite);
  console.log(`Invite created and sent to ${invite.email} with token ${invite.token}`);
};

const resend_post = defineEventHandler(async (event) => {
  try {
    const { inviteId } = await readBody(event);
    const user = await getUserFromEvent(event);
    if (!user) {
      return sendError(event, createError({ statusCode: 401, message: "Unauthorized" }));
    }
    await connectToDatabase();
    const existing = await Invitation.findById(inviteId);
    if (!existing) {
      return sendError(event, createError({ statusCode: 404, message: "Invitation not found" }));
    }
    if (existing.status !== "pending") {
      return sendError(event, createError({ statusCode: 400, message: "Only pending invites can be resent" }));
    }
    await createAndSendInvite({
      email: existing.email,
      name: existing.name,
      role: existing.role,
      inviterId: user._id,
      organizationId: existing.organizationId,
      resend: true
      // optional flag if needed for logging
    });
    return { success: true };
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});

export { resend_post as default };
//# sourceMappingURL=resend.post.mjs.map
