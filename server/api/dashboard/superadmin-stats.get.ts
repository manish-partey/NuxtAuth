import { getUserFromEvent } from '~/server/utils/auth';
import User from '~/server/models/User';
import Organization from '~/server/models/Organization';
import Platform from '~/server/models/Platform';
import Document from '~/server/models/Document';

export default defineEventHandler(async (event) => {
  try {
    // Check authentication
    const user = await getUserFromEvent(event);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      });
    }

    // Super admin can see global stats
    if (user.role !== 'super_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only super admin can access global dashboard stats'
      });
    }

    // Get counts for all entities
    const [
      totalUsers,
      totalOrganizations, 
      totalPlatforms,
      totalDocuments,
      pendingDocuments,
      approvedDocuments,
      rejectedDocuments,
      activeUsers,
      pendingOrganizations,
      approvedOrganizations
    ] = await Promise.all([
      User.countDocuments(),
      Organization.countDocuments(),
      Platform.countDocuments(),
      Document.countDocuments(),
      Document.countDocuments({ status: 'pending' }),
      Document.countDocuments({ status: 'approved' }),
      Document.countDocuments({ status: 'rejected' }),
      User.countDocuments({ active: true }),
      Organization.countDocuments({ status: 'pending' }),
      Organization.countDocuments({ status: 'approved' })
    ]);

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers
      },
      organizations: {
        total: totalOrganizations,
        pending: pendingOrganizations,
        approved: approvedOrganizations,
        rejected: totalOrganizations - pendingOrganizations - approvedOrganizations
      },
      platforms: {
        total: totalPlatforms
      },
      documents: {
        total: totalDocuments,
        pending: pendingDocuments,
        approved: approvedDocuments,
        rejected: rejectedDocuments
      }
    };

    console.log(`[DASHBOARD] Super admin stats retrieved for ${user.email}`);

    return {
      success: true,
      stats
    };

  } catch (error: any) {
    console.error('[DASHBOARD] Error fetching super admin stats:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch dashboard stats'
    });
  }
});