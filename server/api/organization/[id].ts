// server/api/organization/[id].ts
import { defineEventHandler, getRouterParam, createError } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import Organization from '~/server/models/Organization';

export default defineEventHandler(async (event) => {
  try {
  const id = getRouterParam(event, 'id');
  const user = await getUserFromEvent(event);

  if (!user || !['super_admin', 'organization_admin', 'platform_admin'].includes(user.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' });
  }

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing organization ID' });
  }

  try {
    const organization = await Organization.findById(id).populate('platformId', 'name').lean();

    if (!organization) {
      console.error(`[organization/${id}] Organization not found`);
      throw createError({ statusCode: 404, statusMessage: 'Organization not found' });
    }

    console.log(`[organization/${id}] Found organization:`, {
      name: organization.name,
      platformId: organization.platformId,
      hasPlatform: !!organization.platformId
    });

    return {
      success: true,
      ...organization,
    };
  } catch (err) {
    console.error('Error fetching organization:', err);
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch organization' });
  }
  } catch (err) {
    console.error('Error in organization [id].ts:', err);
    throw err;
  }
});
