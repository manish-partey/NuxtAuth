// server/api/org/invite/revoke.post.ts
import { defineEventHandler, readBody, sendError, createError } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import Invitation from '~/server/models/Invitation';
import { connectToDatabase } from '~/server/utils/db';

import { defaultClient } from 'applicationinsights';

export default defineEventHandler(async (event) => {
  try {
  const { inviteId } = await readBody(event);
  const user = await getUserFromEvent(event);
  if (!user) {
    return sendError(event, createError({ statusCode: 401, message: 'Unauthorized' }));
  }

  await connectToDatabase(); // ✅ ensure database is connected
  const invite = await Invitation.findById(inviteId);
  if (!invite) {
    return sendError(event, createError({ statusCode: 404, message: 'Invite not found' }));
  }

  if (invite.status !== 'pending') {
    return sendError(event, createError({ statusCode: 400, message: 'Only pending invites can be revoked' }));
  }

  invite.status = 'expired';
  await invite.save();

  return { success: true };
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});
