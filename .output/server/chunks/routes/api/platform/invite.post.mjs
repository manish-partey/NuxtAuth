import { d as defineEventHandler, e as getUserFromEvent, c as createError, r as readBody, u as useRuntimeConfig } from '../../../nitro/nitro.mjs';
import { c as createAndSendInvite } from '../../../_/invitation.mjs';
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
import '../../../_/Invitation2.mjs';
import 'crypto';
import '../../../_/mail.mjs';
import 'nodemailer';
import '../../../_/inviteUser.mjs';

const invite_post = defineEventHandler(async (event) => {
  try {
    const user = await getUserFromEvent(event);
    if (!user || user.role !== "platform_admin") {
      throw createError({ statusCode: 403, statusMessage: "Forbidden" });
    }
    const body = await readBody(event);
    const { email, role, inviterName } = body;
    if (!email || !role) {
      throw createError({ statusCode: 400, statusMessage: "Email and role are required." });
    }
    const config = useRuntimeConfig();
    const baseUrl = config.public.baseUrl || "http://localhost:3000";
    const invite = await createAndSendInvite({
      email,
      role,
      platformId: user.platformId,
      inviterName: inviterName || user.name,
      baseUrl
    });
    return {
      success: true,
      message: "Invitation sent successfully.",
      inviteId: invite._id
    };
  } catch (err) {
    console.error("[API] Platform Invite POST error:", err);
    throw createError({
      statusCode: 500,
      statusMessage: (err == null ? void 0 : err.message) || "Failed to send invitation."
    });
  }
});

export { invite_post as default };
//# sourceMappingURL=invite.post.mjs.map
