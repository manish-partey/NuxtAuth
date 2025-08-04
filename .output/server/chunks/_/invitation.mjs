import { I as Invitation } from './Invitation2.mjs';
import require$$1 from 'crypto';
import { s as sendEmail } from './mail.mjs';
import { g as generateInviteEmail } from './inviteUser.mjs';

async function createAndSendInvite(data) {
  const existing = await Invitation.findOne({
    email: data.email.toLowerCase(),
    organizationId: data.organizationId,
    status: "pending"
  });
  if (existing) {
    throw new Error("User has already been invited to this organization.");
  }
  const token = require$$1.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3);
  const invite = await Invitation.create({
    email: data.email.toLowerCase(),
    role: data.role,
    organizationId: data.organizationId,
    platformId: data.platformId,
    inviterName: data.inviterName || "Admin",
    token,
    status: "pending",
    expiresAt
  });
  const inviteLink = `${data.baseUrl}/accept-invite?token=${token}`;
  const emailHtml = generateInviteEmail({
    name: data.email,
    inviteLink,
    inviterName: data.inviterName || "Admin"
  });
  await sendEmail(data.email, "You are invited to join EaseMyCargo", emailHtml);
  return invite;
}
async function validateInviteToken(token) {
  const invite = await Invitation.findOne({ token, status: "pending" }).exec();
  if (!invite) return null;
  if (invite.expiresAt < /* @__PURE__ */ new Date()) {
    invite.status = "expired";
    await invite.save();
    return null;
  }
  return invite;
}
async function markInviteAccepted(token) {
  const invite = await Invitation.findOne({ token, status: "pending" }).exec();
  if (!invite) {
    throw new Error("Invalid or expired invitation token.");
  }
  invite.status = "accepted";
  await invite.save();
}

export { createAndSendInvite as c, markInviteAccepted as m, validateInviteToken as v };
//# sourceMappingURL=invitation.mjs.map
