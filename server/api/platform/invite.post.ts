// server/api/platform/invite.post.ts
import { defineEventHandler, readBody, createError } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import { createAndSendInvite } from '~/server/services/invitation';

export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromEvent(event);
    if (!user || user.role !== 'platform_admin') {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
    }

    const body = await readBody(event);
    const { email, role, inviterName } = body;

    if (!email || !role) {
      throw createError({ statusCode: 400, statusMessage: 'Email and role are required.' });
    }

    const config = useRuntimeConfig();
    const baseUrl = config.public.baseUrl || 'http://localhost:3000';

    const invite = await createAndSendInvite({
      email,
      role,
      platformId: user.platformId,
      inviterName: inviterName || user.name,
      baseUrl,
    });

    return {
      success: true,
      message: 'Invitation sent successfully.',
      inviteId: invite._id,
    };
  } catch (err: any) {
    console.error('[API] Platform Invite POST error:', err);
    throw createError({
      statusCode: 500,
      statusMessage: err?.message || 'Failed to send invitation.',
    });
  }
});
