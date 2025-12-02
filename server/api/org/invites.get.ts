import { getUserFromEvent } from '../../utils/auth';
import Invite from '../../models/Invite';
import Organization from '../../models/Organization';

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const user = await getUserFromEvent(event);
    
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      });
    }

    // Verify user is organization admin
    if (user.role !== 'organization_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Organization admin access required'
      });
    }

    // Verify user has organizationId
    if (!user.organizationId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Organization access verification failed'
      });
    }

    // Fetch invites for the user's organization
    const invites = await Invite.find({ 
      organizationId: user.organizationId,
      status: { $in: ['pending', 'expired'] }, // Only show pending and expired invites
      revoked: { $ne: true } // Exclude revoked invites
    })
    .populate('organizationId', 'name')
    .sort({ createdAt: -1 }) // Most recent first
    .lean();

    // Transform the data to match frontend expectations
    const transformedInvites = invites.map(invite => ({
      _id: invite._id,
      email: invite.email,
      role: invite.role,
      inviterName: invite.inviterName,
      status: invite.status,
      createdAt: invite.createdAt,
      organization: invite.organizationId ? {
        name: (invite.organizationId as any).name
      } : null
    }));

    return {
      success: true,
      invites: transformedInvites
    };

  } catch (error: any) {
    console.error('[INVITES_GET] Error:', error);
    
    if (error.statusCode) {
      throw error; // Re-throw createError errors
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch invites'
    });
  }
});