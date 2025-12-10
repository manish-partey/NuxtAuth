// server/api/platform/settings/organization-types.get.ts
import { defineEventHandler, createError } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import Platform from '~/server/models/Platform';
import OrganizationType from '~/server/models/OrganizationType';

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event);

  console.log('[ORG-TYPES-SETTINGS] User:', user?.role, 'Platform:', user?.platformId);

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' });
  }

  if (user.role !== 'platform_admin') {
    throw createError({ 
      statusCode: 403, 
      statusMessage: `Access denied. This endpoint requires platform_admin role, you have: ${user.role}` 
    });
  }

  if (!user.platformId) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Platform admin must be associated with a platform' 
    });
  }

  try {
    console.log('[ORG-TYPES-SETTINGS] Fetching platform:', user.platformId);
    
    const platform = await Platform.findById(user.platformId)
      .populate('allowedOrganizationTypes', 'code name category icon description')
      .lean();

    console.log('[ORG-TYPES-SETTINGS] Platform found:', !!platform);

    if (!platform) {
      console.error('[ORG-TYPES-SETTINGS] Platform not found:', user.platformId);
      throw createError({ statusCode: 404, statusMessage: 'Platform not found' });
    }

    console.log('[ORG-TYPES-SETTINGS] Fetching global types...');
    // Get all available global organization types
    const allGlobalTypes = await OrganizationType.find({
      scope: 'global',
      status: 'active'
    }).select('_id code name category icon description').lean();

    console.log('[ORG-TYPES-SETTINGS] Found', allGlobalTypes.length, 'global types');

    console.log('[ORG-TYPES-SETTINGS] Fetching platform-specific types...');
    // Get platform-specific types
    const platformTypes = await OrganizationType.find({
      scope: 'platform',
      platformId: user.platformId,
      status: 'active'
    }).select('_id code name category icon description').lean();

    console.log('[ORG-TYPES-SETTINGS] Found', platformTypes.length, 'platform types');

    const result = {
      success: true,
      data: {
        platform: {
          category: (platform as any).category || 'other',
          allowedOrganizationTypes: (platform as any).allowedOrganizationTypes || []
        },
        allGlobalTypes,
        platformTypes,
        isUsingAutoFilter: !(platform as any).allowedOrganizationTypes || (platform as any).allowedOrganizationTypes.length === 0
      }
    };

    console.log('[ORG-TYPES-SETTINGS] Returning success with', allGlobalTypes.length, 'global types');
    return result;
  } catch (err: any) {
    console.error('[ORG-TYPES-SETTINGS] Error:', err);
    console.error('[ORG-TYPES-SETTINGS] Error stack:', err.stack);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch organization types settings: ' + err.message
    });
  }
});
