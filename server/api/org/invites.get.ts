import { defineEventHandler, createError } from 'h3';
import { getUserFromEvent } from '../../utils/auth';
import Invite from '../../models/Invite';
import Organization from '../../models/Organization';
import User from '../../models/User';

export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromEvent(event);
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: 'Authentication required' });
    }

    // Check if user is organization admin
    if (user.role !== 'organization_admin') {
      throw createError({ statusCode: 403, statusMessage: 'Only organization admins can view invites' });
    }

    const organizationId = user.organizationId;
    if (!organizationId) {
      throw createError({ statusCode: 403, statusMessage: 'No organization associated' });
    }

    // Fetch invites for the organization with populated data
    const invites = await Invite.find({ 
      organizationId,
      status: 'pending',
      revoked: { $ne: true },
      expiresAt: { $gt: new Date() } // Only non-expired invites
    })
    .populate('inviterUserId', 'name email')
    .populate('organizationId', 'name')
    .sort({ createdAt: -1 })
    .lean();

    // Format the response
    const formattedInvites = invites.map((invite: any) => ({
      _id: invite._id.toString(),
      email: invite.email,
      role: invite.role,
      status: invite.status,
      inviterName: invite.inviterUserId?.name || 'Unknown',
      createdAt: invite.createdAt,
      expiresAt: invite.expiresAt,
      organization: invite.organizationId ? {
        name: invite.organizationId.name
      } : null
    }));

    return {
      success: true,
      invites: formattedInvites
    };
  } catch (error: any) {
    console.error('[API] Get org invites error:', error);
    throw error.statusCode ? error : createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch invites'
    });
  }
});
