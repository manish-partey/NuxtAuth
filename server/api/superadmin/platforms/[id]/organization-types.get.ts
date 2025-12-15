// server/api/superadmin/platforms/[id]/organization-types.get.ts
import { defineEventHandler, createError, getRouterParam } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import Platform from '~/server/models/Platform';
import OrganizationType from '~/server/models/OrganizationType';

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event);

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' });
  }

  if (user.role !== 'super_admin') {
    throw createError({ 
      statusCode: 403, 
      statusMessage: 'Only super administrators can manage platform organization types' 
    });
  }

  const platformId = getRouterParam(event, 'id');
  if (!platformId) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Platform ID is required' 
    });
  }

  try {
    console.log('[SUPERADMIN ORG-TYPES] Looking for platform with ID:', platformId);
    
    const platform = await Platform.findById(platformId)
      .populate('allowedOrganizationTypes', 'code name category icon description')
      .lean();

    console.log('[SUPERADMIN ORG-TYPES] Platform found:', platform ? 'YES' : 'NO');

    if (!platform) {
      throw createError({ statusCode: 404, statusMessage: 'Platform not found' });
    }

    // Get all available global organization types
    const allGlobalTypes = await OrganizationType.find({
      scope: 'global',
      status: 'active'
    }).select('_id code name category icon description').lean();

    // Get platform-specific types
    const platformTypes = await OrganizationType.find({
      scope: 'platform',
      platformId: platformId,
      status: 'active'
    }).select('_id code name category icon description').lean();

    return {
      success: true,
      data: {
        platform: {
          _id: (platform as any)._id,
          name: (platform as any).name,
          category: (platform as any).category || 'other',
          allowedOrganizationTypes: (platform as any).allowedOrganizationTypes || []
        },
        allGlobalTypes,
        platformTypes,
        isUsingAutoFilter: !(platform as any).allowedOrganizationTypes || (platform as any).allowedOrganizationTypes.length === 0
      }
    };
  } catch (err: any) {
    console.error('[SUPERADMIN ORG-TYPES] Error:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to fetch organization types settings'
    });
  }
});
