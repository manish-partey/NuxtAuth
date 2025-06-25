// server/api/platform/invite/revoke.post.ts
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

  invite.revoked = true;
  invite.status = 'expired';
  await invite.save();

  return { success: true, message: 'Invite revoked successfully.' };
});
