// server/api/org/invite/resend.post.ts
import { defineEventHandler, readBody, createError, sendError } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import Invitation from '~/server/models/Invitation';
import { createAndSendInvite } from '~/server/services/invite';
import { connectToDatabase } from '~/server/utils/db'; // ✅ fixed import


export default defineEventHandler(async (event) => {
  try {
  const { inviteId } = await readBody(event);
  const user = await getUserFromEvent(event);
  if (!user) {
    return sendError(event, createError({ statusCode: 401, message: 'Unauthorized' }));
  }

  await connectToDatabase(); // ✅ uses correct function to connect DB

  const existing = await Invitation.findById(inviteId);
  if (!existing) {
    return sendError(event, createError({ statusCode: 404, message: 'Invitation not found' }));
  }
  if (existing.status !== 'pending') {
    return sendError(event, createError({ statusCode: 400, message: 'Only pending invites can be resent' }));
  }

  await createAndSendInvite({
    email: existing.email,
    name: existing.name,
    role: existing.role,
    inviterId: user._id,
    organizationId: existing.organizationId,
    resend: true, // optional flag if needed for logging
  });

  return { success: true };
  } catch (err) {
    throw err;
  }
});
