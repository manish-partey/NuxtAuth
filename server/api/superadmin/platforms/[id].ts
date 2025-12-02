import { defineEventHandler, createError, readBody } from 'h3';
import { requireRole } from '~/server/utils/auth';
import Platform from '~/server/models/Platform';
import Organization from '~/server/models/Organization';
import User from '~/server/models/User';

export default defineEventHandler(async (event) => {
  try {
    // Check authentication and authorization - only super_admin
    const user = await requireRole(event, ['super_admin']);
    
    const platformId = getRouterParam(event, 'id');
    
    console.log("=== PLATFORM API ENDPOINT ===");
    console.log("Method:", event.node.req.method);
    console.log("Platform ID:", platformId);
    console.log("User:", user.id, user.role);
    
    if (!platformId) {
      console.error("No platform ID provided");
      throw createError({
        statusCode: 400,
        statusMessage: 'Platform ID is required'
      });
    }

    if (event.node.req.method === 'GET') {
      // Get specific platform
      const platform = await Platform.findById(platformId).lean() as { _id: string; [key: string]: any } | null;

      if (!platform) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Platform not found'
        });
      }

      // Get organization and user counts
      const organizationCount = await Organization.countDocuments({ 
        platformId: platform._id
      });
      
      const userCount = await User.countDocuments({ 
        platformId: platform._id 
      });

      return {
        success: true,
        platform: {
          _id: platform._id,
          name: platform.name,
          description: platform.description || '',
          slug: platform.slug,
          active: platform.status === 'active',
          status: platform.status,
          createdAt: platform.createdAt,
          organizationCount,
          userCount
        }
      };
    }

    if (event.node.req.method === 'PUT') {
      // Update platform
      const body = await readBody(event);
      const { name, description, active } = body;

      if (!name || name.trim() === '') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Platform name is required'
        });
      }

      // Check if another platform with the same name exists
      const existingPlatform = await Platform.findOne({
        name: name.trim(),
        _id: { $ne: platformId }
      });

      if (existingPlatform) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Another platform with this name already exists'
        });
      }

      // Generate slug from name
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      // Update the platform
      const updatedPlatform = await Platform.findByIdAndUpdate(
        platformId,
        {
          name: name.trim(),
          description: description?.trim() || '',
          slug,
          status: active !== undefined ? (active ? 'active' : 'inactive') : undefined
        },
        { new: true, runValidators: true }
      ).lean() as { _id: string; [key: string]: any } | null;

      if (!updatedPlatform) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Platform not found'
        });
      }

      // Get updated counts
      const organizationCount = await Organization.countDocuments({ 
        platformId: updatedPlatform._id
      });
      
      const userCount = await User.countDocuments({ 
        platformId: updatedPlatform._id 
      });

      console.log(`[SUPERADMIN] Platform "${name}" updated by user ${user.id}`);

      return {
        success: true,
        message: 'Platform updated successfully',
        platform: {
          _id: updatedPlatform._id,
          name: updatedPlatform.name,
          description: updatedPlatform.description,
          slug: updatedPlatform.slug,
          active: updatedPlatform.status === 'active',
          status: updatedPlatform.status,
          createdAt: updatedPlatform.createdAt,
          organizationCount,
          userCount
        }
      };
    }

    if (event.node.req.method === 'DELETE') {
      // Delete platform (soft delete by setting status to inactive)
      const platform = await Platform.findByIdAndUpdate(
        platformId,
        {
          status: 'inactive'
        },
        { new: true }
      );

      if (!platform) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Platform not found'
        });
      }

      console.log(`[SUPERADMIN] Platform "${platform.name}" deleted by user ${user.id}`);

      return {
        success: true,
        message: 'Platform deleted successfully'
      };
    }

    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    });

  } catch (error: any) {
    console.error('[SUPERADMIN] Error managing specific platform:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to manage platform'
    });
  }
});