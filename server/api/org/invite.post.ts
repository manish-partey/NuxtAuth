// server/api/org/invite.post.ts
import { defineEventHandler, readBody, createError } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import { createAndSendInvite } from '~/server/services/invitation';

export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromEvent(event);
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
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
      organizationId: user.organizationId,
      platformId: user.platformId || null,
      inviterName: inviterName || user.name,
      baseUrl,
    });

    return {
      success: true,
      message: 'Invitation sent successfully.',
      inviteId: invite._id,
    };
  } catch (err: any) {
    console.error('[API] Invite POST error:', err);
    throw createError({
      statusCode: 500,
      statusMessage: err?.message || 'Failed to send invitation.',
    });
  }
});
