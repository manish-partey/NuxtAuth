// server/api/platform/invite/resend.post.ts
import { readBody, createError } from 'h3';
import Invitation from '~/server/models/Invitation';
import { getUserFromEvent } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const { inviteId } = await readBody(event);
  const currentUser = await getUserFromEvent(event);

  if (!currentUser || currentUser.role !== 'platform_admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
  }

  const invite = await Invitation.findById(inviteId);
  if (!invite || invite.platformId?.toString() !== currentUser.platformId?.toString()) {
    throw createError({ statusCode: 404, statusMessage: 'Invite not found or unauthorized' });
  }

  if (invite.status !== 'pending' || invite.revoked) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot resend this invite' });
  }

  // Optionally re-send the invitation email here
  // await sendInvitationEmail(invite);

  return { success: true, message: 'Invite resent successfully.' };
});
