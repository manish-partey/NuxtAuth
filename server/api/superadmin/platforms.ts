import { defineEventHandler, createError, readBody } from 'h3';
import { requireRole } from '~/server/utils/auth';
import { connectToDatabase } from '~/server/utils/db';
import Platform from '~/server/models/Platform';
import Organization from '~/server/models/Organization';
import User from '~/server/models/User';

export default defineEventHandler(async (event) => {
  try {
    // Ensure database connection
    await connectToDatabase();
    
    // Check authentication and authorization
    const user = await requireRole(event, ['super_admin']);

    if (event.node.req.method === 'GET') {
      // Get all platforms from platforms collection
      console.log('[SUPERADMIN] Fetching platforms from platforms collection');
      
      const platforms = await Platform.find({})
        .sort({ createdAt: -1 })
        .lean();
        
      console.log('[SUPERADMIN] Found platforms count:', platforms.length);
      console.log('[SUPERADMIN] Platform details:', platforms.map(p => ({ name: p.name, status: p.status, _id: p._id })));

      // Add organization and user counts for each platform
      const platformsWithCounts = await Promise.all(
        platforms.map(async (platform) => {
          const organizationCount = await Organization.countDocuments({ 
            platformId: platform._id
          });
          
          // Count users belonging to this platform
          const userCount = await User.countDocuments({ platformId: platform._id });
          
          return {
            _id: platform._id,
            name: platform.name,
            description: platform.description || '',
            slug: platform.slug,
            active: platform.status === 'active',
            status: platform.status,
            createdAt: platform.createdAt,
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
      const existingPlatform = await Platform.findOne({ 
        name: name
      });

      if (existingPlatform) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Platform with this name already exists'
        });
      }

      // Generate slug from name
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      console.log('[SUPERADMIN] Creating platform with data:', { name, description, slug, status: 'active', createdBy: user.id });

      // Create platform
      const platform = new Platform({
        name,
        description: description || '',
        slug,
        status: 'active',
        createdBy: user.id
      });

      console.log('[SUPERADMIN] Platform instance created, attempting to save...');
      const savedPlatform = await platform.save();
      console.log('[SUPERADMIN] Platform saved successfully:', savedPlatform);

      console.log(`[SUPERADMIN] Platform "${name}" created by user ${user.id}`);

      return {
        success: true,
        message: 'Platform created successfully',
        platform: {
          _id: platform._id,
          name: platform.name,
          description: platform.description,
          slug: platform.slug,
          active: true,
          status: platform.status,
          createdAt: platform.createdAt,
          organizationCount: 0,
          userCount: 0
        }
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