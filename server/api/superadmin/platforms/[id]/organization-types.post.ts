// server/api/superadmin/platforms/[id]/organization-types.post.ts
import { defineEventHandler, createError, readBody, getRouterParam } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import Platform from '~/server/models/Platform';
import AuditLog from '~/server/models/AuditLog';

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

  const body = await readBody(event);
  const { useAutoFilter, organizationTypeIds } = body;

  try {
    const platform = await Platform.findById(platformId);

    if (!platform) {
      throw createError({ statusCode: 404, statusMessage: 'Platform not found' });
    }

    const oldAllowedTypes = platform.allowedOrganizationTypes || [];

    if (useAutoFilter) {
      // Clear manual selection - use auto-filter based on platform category
      platform.allowedOrganizationTypes = undefined;
    } else {
      // Set manual selection
      if (!Array.isArray(organizationTypeIds)) {
        throw createError({ 
          statusCode: 400, 
          statusMessage: 'organizationTypeIds must be an array' 
        });
      }
      platform.allowedOrganizationTypes = organizationTypeIds;
    }

    await platform.save();

    // Log audit
    try {
      const ipAddress = (event.node.req.headers['x-forwarded-for'] as string) || 
                        event.node.req.socket?.remoteAddress || 'unknown';
      const userAgent = (event.node.req.headers['user-agent'] as string) || 'unknown';

      await AuditLog.create({
        action: 'UPDATE_PLATFORM_ORG_TYPES',
        targetType: 'Platform',
        targetId: platformId,
        userId: user.id,
        platformId: platformId,
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
        ipAddress,
        userAgent
      });
    } catch (auditError) {
      console.error('[SUPERADMIN ORG-TYPES] Failed to log audit:', auditError);
    }

    return {
      success: true,
      message: 'Organization types settings updated successfully'
    };
  } catch (err: any) {
    console.error('[SUPERADMIN ORG-TYPES] Error:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to update organization types settings'
    });
  }
});
