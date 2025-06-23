// server/api/org/resend.post.ts

import { defineEventHandler, readBody, createError } from 'h3';
import Invitation from '~/server/models/Invitation';
import { sendEmail } from '~/server/utils/mail';
import { getUserFromEvent } from '~/server/utils/auth';
import { defaultClient } from 'applicationinsights';

export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromEvent(event);
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });

    const { inviteId } = await readBody(event);
    if (!inviteId) throw createError({ statusCode: 400, statusMessage: 'Invite ID is required' });

    const invite = await Invitation.findById(inviteId);
    if (!invite) throw createError({ statusCode: 404, statusMessage: 'Invite not found' });

    // Resend email logic
    const baseUrl = useRuntimeConfig().public.baseUrl || 'http://localhost:3000';
    const inviteLink = `${baseUrl}/accept-invite?token=${invite.token}`;

    await sendEmail(invite.email, invite.name, inviteLink); // Adjust function as per your project

    return { success: true, message: 'Invitation resent successfully.' };
  } catch (err) {
    if (typeof defaultClient?.trackException === 'function') {
      defaultClient.trackException({ exception: err });
    }
    throw createError({ statusCode: 500, statusMessage: 'Failed to resend invite' });
  }
});
