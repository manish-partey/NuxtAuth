import { defineEventHandler, createError, readBody } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import Organization from '~/server/models/Organization';
import User from '~/server/models/User';

export default defineEventHandler(async (event) => {
  try {
    // Check authentication and authorization
    const user = await getUserFromEvent(event);
    if (!user || !['super_admin', 'platform_admin'].includes(user.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only super admin or platform admin can manage platforms'
      });
    }

    if (event.node.req.method === 'GET') {
      // Get all platforms
      console.log('[SUPERADMIN] Fetching platforms with type: platform');
      
      // First, let's check all organizations to see what types exist
      const allOrganizations = await Organization.find({})
        .select('name type _id')
        .lean();
      console.log('[SUPERADMIN] All organizations:', allOrganizations);
      
      const platforms = await Organization.find({ type: 'platform' })
        .sort({ createdAt: -1 })
        .lean();
        
      console.log('[SUPERADMIN] Found platforms count:', platforms.length);
      console.log('[SUPERADMIN] Platform details:', platforms.map(p => ({ name: p.name, type: p.type, _id: p._id })));

      // Add organization and user counts for each platform
      const platformsWithCounts = await Promise.all(
        platforms.map(async (platform) => {
          const organizationCount = await Organization.countDocuments({ 
            platformId: platform._id,
            type: { $ne: 'platform' }
          });
          
          // Count users belonging to this platform
          const userCount = await User.countDocuments({ platformId: platform._id });
          
          return {
            ...platform,
            organizationCount,
            userCount
          };
        })
      );

      return {
        success: true,
        platforms: platformsWithCounts
      };
    }

    if (event.node.req.method === 'POST') {
      // Create new platform
      const body = await readBody(event);
      const { name, description } = body;

      if (!name) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Platform name is required'
        });
      }

      // Check if platform name already exists
      const existingPlatform = await Organization.findOne({ 
        name: name,
        type: 'platform'
      });

      if (existingPlatform) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Platform with this name already exists'
        });
      }

      // Create platform
      const platform = new Organization({
        name,
        description,
        type: 'platform',
        active: true,
        createdBy: user.id,
        createdAt: new Date()
      });

      await platform.save();

      console.log(`[SUPERADMIN] Platform "${name}" created by user ${user.id}`);

      return {
        success: true,
        message: 'Platform created successfully',
        platform: platform.toObject()
      };
    }

    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    });

  } catch (error: any) {
    console.error('[SUPERADMIN] Error managing platforms:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to manage platforms'
    });
  }
});