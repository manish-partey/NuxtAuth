import { U as User, u as useRuntimeConfig, d as defineEventHandler, e as getUserFromEvent, c as createError, r as readBody } from '../../../nitro/nitro.mjs';
import { nanoid } from 'nanoid';
import { I as Invitation } from '../../../_/Invitation2.mjs';
import { s as sendEmail } from '../../../_/mail.mjs';
import { g as generateInviteEmail } from '../../../_/inviteUser.mjs';
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

async function inviteUser({
  email,
  name,
  role,
  organizationId,
  platformId,
  inviterName = "Admin"
}) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }
  const existingInvite = await Invitation.findOne({ email, status: "pending" });
  if (existingInvite) {
    throw new Error("An invitation is already pending for this email.");
  }
  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3);
  const invitation = await Invitation.create({
    email,
    name,
    role,
    token,
    platformId,
    organizationId,
    status: "pending",
    expiresAt
  });
  const config = useRuntimeConfig();
  const inviteLink = `${config.public.baseUrl}/accept-invite?token=${token}`;
  const html = generateInviteEmail({
    name,
    inviteLink,
    inviterName
  });
  await sendEmail(email, "You\u2019re Invited to EaseMyCargo", html);
  return invitation;
}

const invite_post = defineEventHandler(async (event) => {
  try {
    const user = await getUserFromEvent(event);
    if (!user) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }
    const body = await readBody(event);
    const { email, name, role, organizationId, platformId } = body;
    const allowedRolesForInviter = {
      "super_admin": ["super_admin", "platform-admin", "organization-admin", "admin", "user"],
      "platform-admin": ["organization-admin", "admin", "user"],
      // Can invite org admins or lower under their platform
      "organization-admin": ["admin", "user"]
      // Can invite users/admins within their org only
    };
    if (user.role === "super_admin") {
    } else if (user.role === "platform-admin") {
      if (platformId !== user.platformId) {
        throw createError({ statusCode: 403, message: "Cannot invite users to other platforms" });
      }
      if (!allowedRolesForInviter["platform-admin"].includes(role)) {
        throw createError({ statusCode: 403, message: "Role not allowed to be assigned by platform admin" });
      }
    } else if (user.role === "organization-admin") {
      if (organizationId !== user.organizationId) {
        throw createError({ statusCode: 403, message: "Cannot invite users to other organizations" });
      }
      if (!allowedRolesForInviter["organization-admin"].includes(role)) {
        throw createError({ statusCode: 403, message: "Role not allowed to be assigned by organization admin" });
      }
    } else {
      throw createError({ statusCode: 403, message: "Insufficient permissions to invite users" });
    }
    try {
      const invitedUser = await inviteUser({ email, name, role, organizationId, platformId });
      return { success: true, invitedUser };
    } catch (err) {
      return { success: false, message: err.message };
    }
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});

export { invite_post as default };
//# sourceMappingURL=invite.post.mjs.map
