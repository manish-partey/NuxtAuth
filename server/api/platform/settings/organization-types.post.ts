// server/api/platform/settings/organization-types.post.ts
import { defineEventHandler, readBody, createError } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import Platform from '~/server/models/Platform';
import OrganizationType from '~/server/models/OrganizationType';
import { invalidateOrgTypeCache } from '~/server/utils/cache';
import { logAudit } from '~/server/services/audit';

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event);

  if (!user || user.role !== 'platform_admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
  }

  const body = await readBody(event);
  const { organizationTypeIds, useAutoFilter } = body;

  try {
    const platform = await Platform.findById(user.platformId);

    if (!platform) {
      throw createError({ statusCode: 404, statusMessage: 'Platform not found' });
    }

    const oldAllowedTypes = platform.allowedOrganizationTypes || [];

    if (useAutoFilter === true) {
      // Clear manual restrictions, use category-based auto-filter
      platform.allowedOrganizationTypes = [];
    } else {
      // Validate that all provided IDs exist
      if (!organizationTypeIds || !Array.isArray(organizationTypeIds)) {
        throw createError({ 
          statusCode: 400, 
          statusMessage: 'organizationTypeIds must be an array' 
        });
      }

      const validTypes = await OrganizationType.find({
        _id: { $in: organizationTypeIds },
        scope: 'global',
        status: 'active'
      });

      if (validTypes.length !== organizationTypeIds.length) {
        throw createError({ 
          statusCode: 400, 
          statusMessage: 'Some organization type IDs are invalid' 
        });
      }

      platform.allowedOrganizationTypes = organizationTypeIds;
    }

    await platform.save();

    // Invalidate cache
    invalidateOrgTypeCache(user.platformId);

    // Log audit
    await logAudit({
      action: 'UPDATE_PLATFORM_ORG_TYPES',
      entityType: 'Platform',
      entityId: platform._id.toString(),
      userId: user.id,
      platformId: user.platformId,
      details: {
        useAutoFilter,
        oldCount: oldAllowedTypes.length,
        newCount: platform.allowedOrganizationTypes?.length || 0,
        added: organizationTypeIds?.filter((id: string) => 
          !oldAllowedTypes.some((old: any) => old.toString() === id)
        ) || [],
        removed: oldAllowedTypes.filter((old: any) => 
          !organizationTypeIds?.includes(old.toString())
        ).map((id: any) => id.toString()) || []
      },
      event
    });

    return {
      success: true,
      message: useAutoFilter 
        ? 'Now using automatic category-based filtering'
        : `Allowed organization types updated (${platform.allowedOrganizationTypes.length} types selected)`
    };
  } catch (err: any) {
    if (err.statusCode) throw err;
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update organization types settings',
      data: err.message
    });
  }
});
