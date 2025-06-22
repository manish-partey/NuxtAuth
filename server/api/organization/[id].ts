// server/api/organization/[id].ts
import { defineEventHandler, getRouterParam, createError } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import Organization from '~/server/models/Organization';

import { defaultClient } from 'applicationinsights';

export default defineEventHandler(async (event) => {
  try {
  const id = getRouterParam(event, 'id');
  const user = await getUserFromEvent(event);

  if (!user || user.role !== 'super_admin') {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' });
  }

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing organization ID' });
  }

  try {
    const organization = await Organization.findById(id).lean();

    if (!organization) {
      throw createError({ statusCode: 404, statusMessage: 'Organization not found' });
    }

    return {
      success: true,
      ...organization,
    };
  } catch (err) {
    console.error('Error fetching organization:', err);
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch organization' });
  }
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});
