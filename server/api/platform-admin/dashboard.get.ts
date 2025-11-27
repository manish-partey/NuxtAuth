import { defineEventHandler, createError } from 'h3';
import { requireRole } from '~/server/utils/auth';
import Organization from '~/server/models/Organization';
import User from '~/server/models/User';
import Document from '~/server/models/document';

export default defineEventHandler(async (event) => {
  try {
    // Check authentication and authorization - only platform_admin
    const user = await requireRole(event, ['platform_admin']);

    if (!user.platformId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Platform ID not found for user'
      });
    }

    // Get counts for the platform admin's platform
    const [organizationCount, userCount, documentCount] = await Promise.all([
      // Count organizations belonging to this platform
      Organization.countDocuments({ 
        platformId: user.platformId
      }),
      
      // Count users belonging to this platform
      User.countDocuments({ 
        platformId: user.platformId 
      }),
      
      // Count documents for organizations in this platform
      Document.countDocuments({ 
        platformId: user.platformId 
      })
    ]);

    console.log(`[PLATFORM-ADMIN] Dashboard stats for platform ${user.platformId}:`, {
      organizationCount,
      userCount,
      documentCount,
      inviteCount: 0
    });

    return {
      success: true,
      stats: {
        organizationCount,
        userCount,
        documentCount,
        inviteCount: 0 // TODO: Implement when Invite model is created
      }
    };

  } catch (error: any) {
    console.error('[PLATFORM-ADMIN] Dashboard error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to load dashboard statistics'
    });
  }
});
