import { getUserFromEvent } from '~/server/utils/auth';
import User from '~/server/models/User';
import Document from '~/server/models/document';
import Organization from '~/server/models/Organization';
import Platform from '~/server/models/Platform';

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

    // Organization users can see stats for their organization
    if (!['organization_admin', 'manager', 'employee', 'guest'].includes(user.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only organization users can access organization dashboard stats'
      });
    }

    // Get organization ID from user
    const organizationId = user.organizationId;
    if (!organizationId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Organization admin must be associated with an organization'
      });
    }

    // Fetch organization and platform details
    const organization = await Organization.findById(organizationId)
      .populate('platformId', 'name')
      .lean();

    if (!organization) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Organization not found'
      });
    }

    // Get counts for organization entities
    const [
      totalUsers,
      activeUsers,
      userDocuments,
      orgDocuments,
      pendingDocuments,
      approvedDocuments,
      rejectedDocuments,
      totalInvites
    ] = await Promise.all([
      User.countDocuments({ organizationId }),
      User.countDocuments({ organizationId, active: true }),
      Document.countDocuments({ layer: 'user', layerId: { $in: await getUserIds(organizationId) } }),
      Document.countDocuments({ layer: 'organization', layerId: organizationId }),
      Document.countDocuments({ 
        $or: [
          { layer: 'organization', layerId: organizationId },
          { layer: 'user', layerId: { $in: await getUserIds(organizationId) } }
        ],
        status: 'pending' 
      }),
      Document.countDocuments({ 
        $or: [
          { layer: 'organization', layerId: organizationId },
          { layer: 'user', layerId: { $in: await getUserIds(organizationId) } }
        ],
        status: 'approved' 
      }),
      Document.countDocuments({ 
        $or: [
          { layer: 'organization', layerId: organizationId },
          { layer: 'user', layerId: { $in: await getUserIds(organizationId) } }
        ],
        status: 'rejected' 
      }),
      // TODO: Add invite count when invite model is available
      Promise.resolve(0)
    ]);

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers
      },
      documents: {
        organization: orgDocuments,
        user: userDocuments,
        total: orgDocuments + userDocuments,
        pending: pendingDocuments,
        approved: approvedDocuments,
        rejected: rejectedDocuments
      },
      invites: {
        total: totalInvites,
        pending: 0 // TODO: Implement when invite status tracking is available
      }
    };

    console.log(`[DASHBOARD] Organization admin stats retrieved for organization ${organizationId}`);

    return {
      success: true,
      stats,
      organization: {
        name: organization.name,
        platform: {
          name: organization.platformId?.name || 'Unknown',
          id: organization.platformId?._id || ''
        }
      },
      role: user.role
    };

  } catch (error: any) {
    console.error('[DASHBOARD] Error fetching organization admin stats:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch dashboard stats'
    });
  }
});

// Helper function
async function getUserIds(organizationId: string) {
  const users = await User.find({ organizationId }).select('_id');
  return users.map(user => user._id);
}