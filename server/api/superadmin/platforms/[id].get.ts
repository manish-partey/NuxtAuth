import { defineEventHandler, getRouterParam, createError } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import Organization from '~/server/models/Organization';

export default defineEventHandler(async (event) => {
  try {
    // Check authentication and authorization
    const user = await getUserFromEvent(event);
    if (!user || user.role !== 'super_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only super admin can view platforms'
      });
    }

    const platformId = getRouterParam(event, 'id');
    
    if (!platformId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Platform ID is required'
      });
    }

    // Find the platform
    const platform = await Organization.findOne({ 
      _id: platformId,
      type: 'platform' 
    }).lean();

    if (!platform) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Platform not found'
      });
    }

    // Add organization and user counts for this platform
    const organizationCount = await Organization.countDocuments({ 
      platformId: (platform as any)._id,
      type: { $ne: 'platform' }
    });

    const platformWithCounts = {
      ...platform,
      organizationCount,
      userCount: 0 // TODO: Add User model count when available
    };

    return {
      success: true,
      platform: platformWithCounts
    };

  } catch (error: any) {
    console.error('Error fetching platform:', error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch platform'
    });
  }
});