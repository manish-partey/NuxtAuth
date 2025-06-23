// server/api/user/invite.get.ts

import { defineEventHandler, getQuery, createError } from 'h3';
import Invitation from '~/server/models/Invitation';
import Platform from '~/server/models/Platform';
import Organization from '~/server/models/Organization';
import { defaultClient } from 'applicationinsights';

export default defineEventHandler(async (event) => {
  try {
    const { token } = getQuery(event);

    if (!token || typeof token !== 'string') {
      throw createError({ statusCode: 400, statusMessage: 'Invalid or missing token' });
    }

    const invitation = await Invitation.findOne({ token }).lean();

    if (!invitation) {
      throw createError({ statusCode: 404, statusMessage: 'Invitation not found' });
    }

    const org = invitation.organizationId
      ? await Organization.findById(invitation.organizationId).select('name')
      : null;

    const platform = invitation.platformId
      ? await Platform.findById(invitation.platformId).select('name')
      : null;

    return {
      success: true,
      invitation: {
        email: invitation.email,
        role: invitation.role,
        organizationName: org?.name || '',
        platformName: platform?.name || '',
      },
    };
  } catch (err: any) {
    if (typeof defaultClient?.trackException === 'function') {
      defaultClient.trackException({ exception: err });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Server Error',
      data: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});
