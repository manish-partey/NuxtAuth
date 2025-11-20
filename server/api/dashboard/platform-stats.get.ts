import { getUserFromEvent } from '~/server/utils/auth';
import User from '~/server/models/User';
import Organization from '~/server/models/Organization';
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

    // Platform admin can see stats for their platform
    if (user.role !== 'platform_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only platform admin can access platform dashboard stats'
      });
    }

    // Get platform ID from user
    const platformId = user.platformId;
    if (!platformId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Platform admin must be associated with a platform'
      });
    }

    // Get counts for platform entities
    const [
      totalOrganizations,
      pendingOrganizations,
      approvedOrganizations,
      totalUsers,
      activeUsers,
      orgDocuments,
      userDocuments,
      pendingDocuments
    ] = await Promise.all([
      Organization.countDocuments({ platformId }),
      Organization.countDocuments({ platformId, status: 'pending' }),
      Organization.countDocuments({ platformId, status: 'approved' }),
      User.countDocuments({ platformId }),
      User.countDocuments({ platformId, active: true }),
      Document.countDocuments({ layer: 'organization', layerId: { $in: await getOrganizationIds(platformId) } }),
      Document.countDocuments({ layer: 'user', layerId: { $in: await getUserIds(platformId) } }),
      Document.countDocuments({ 
        $or: [
          { layer: 'organization', layerId: { $in: await getOrganizationIds(platformId) } },
          { layer: 'user', layerId: { $in: await getUserIds(platformId) } }
        ],
        status: 'pending' 
      })
    ]);

    const stats = {
      organizations: {
        total: totalOrganizations,
        pending: pendingOrganizations,
        approved: approvedOrganizations,
        rejected: totalOrganizations - pendingOrganizations - approvedOrganizations
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers
      },
      documents: {
        organization: orgDocuments,
        user: userDocuments,
        pending: pendingDocuments,
        total: orgDocuments + userDocuments
      }
    };

    console.log(`[DASHBOARD] Platform admin stats retrieved for platform ${platformId}`);

    return {
      success: true,
      stats
    };

  } catch (error: any) {
    console.error('[DASHBOARD] Error fetching platform admin stats:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch dashboard stats'
    });
  }
});

// Helper functions
async function getOrganizationIds(platformId: string) {
  const organizations = await Organization.find({ platformId }).select('_id');
  return organizations.map(org => org._id);
}

async function getUserIds(platformId: string) {
  const users = await User.find({ platformId }).select('_id');
  return users.map(user => user._id);
}