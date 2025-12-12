// server/api/superadmin/platforms/[id]/toggle-status.post.ts
import { defineEventHandler, getRouterParam, createError } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import Platform from '~/server/models/Platform';

export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromEvent(event);
    
    // Only super_admin can toggle platform status
    if (!user || user.role !== 'super_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only super admins can suspend/activate platforms'
      });
    }

    const platformId = getRouterParam(event, 'id');
    if (!platformId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Platform ID is required'
      });
    }

    const platform = await Platform.findById(platformId);
    if (!platform) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Platform not found'
      });
    }

    // Toggle status: active <-> suspended
    const newStatus = platform.status === 'active' ? 'suspended' : 'active';
    platform.status = newStatus;
    await platform.save();

    console.log(`[PLATFORM-TOGGLE-STATUS] Platform ${platform.name} status changed to ${newStatus} by super admin ${user.email}`);

    return {
      success: true,
      message: `Platform ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`,
      platform: {
        id: platform._id,
        name: platform.name,
        status: platform.status
      }
    };
  } catch (err: any) {
    console.error('[PLATFORM-TOGGLE-STATUS] Error:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to toggle platform status'
    });
  }
});
