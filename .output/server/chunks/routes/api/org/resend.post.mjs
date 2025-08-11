import { d as defineEventHandler, e as getUserFromEvent, c as createError, r as readBody, u as useRuntimeConfig } from '../../../nitro/nitro.mjs';
import { I as Invitation } from '../../../_/Invitation2.mjs';
import { s as sendEmail } from '../../../_/mail.mjs';
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
import 'nodemailer';

const resend_post = defineEventHandler(async (event) => {
  var _a;
  try {
    const user = await getUserFromEvent(event);
    if (!user) throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    const { inviteId } = await readBody(event);
    if (!inviteId) throw createError({ statusCode: 400, statusMessage: "Invite ID is required" });
    const invite = await Invitation.findById(inviteId);
    if (!invite) throw createError({ statusCode: 404, statusMessage: "Invite not found" });
    const baseUrl = useRuntimeConfig().public.baseUrl || "http://localhost:3000";
    const inviteLink = `${baseUrl}/accept-invite?token=${invite.token}`;
    await sendEmail(invite.email, invite.name, inviteLink);
    return { success: true, message: "Invitation resent successfully." };
  } catch (err) {
    if (typeof ((_a = defaultClient) == null ? void 0 : _a.trackException) === "function") {
      defaultClient.trackException({ exception: err });
    }
    throw createError({ statusCode: 500, statusMessage: "Failed to resend invite" });
  }
});

export { resend_post as default };
//# sourceMappingURL=resend.post.mjs.map
