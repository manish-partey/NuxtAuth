import Invitation from '~/server/models/Invitation';
import { getUserFromEvent } from '~/server/utils/auth';
import { createError } from 'h3';

export default defineEventHandler(async (event) => {
  const currentUser = await getUserFromEvent(event);
  if (!currentUser || currentUser.role !== 'platform_admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
  }

  const invites = await Invitation.find({
    platformId: currentUser.platformId,
    status: 'pending',
    revoked: { $ne: true },
  }).sort({ createdAt: -1 });

  return { success: true, invites };
});
