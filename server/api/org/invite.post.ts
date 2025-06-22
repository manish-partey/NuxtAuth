// server/api/org/invite.post.ts
import { defineEventHandler, readBody, createError } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import { createAndSendInvite } from '~/server/services/invitation';

import { defaultClient } from 'applicationinsights';

export default defineEventHandler(async (event) => {
  try {
  const user = await getUserFromEvent(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const body = await readBody(event);
  const { email, role, platformId, inviterName } = body;

  // Validate required fields
  if (!email || !role) {
    throw createError({ statusCode: 400, statusMessage: 'Email and role are required.' });
  }

  const config = useRuntimeConfig();
  const baseUrl = config.public.baseUrl || 'http://localhost:3000';

  try {
    const invite = await createAndSendInvite({
      email,
      role,
      organizationId: user.organizationId, // Securely derive from logged-in user
      platformId: platformId || null,
      inviterName: inviterName || user.name,
      baseUrl,
    });

    return {
      success: true,
      message: 'Invitation sent successfully.',
      inviteId: invite._id,
    };
  } catch (error: any) {
    console.error('Invite Error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error?.message || 'Failed to send invitation.',
    });
  }
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});
