import { defineEventHandler, createError } from 'h3';
import { getUserFromEvent } from '../../utils/auth';
import Invite from '../../models/Invite';
import Organization from '../../models/Organization';
import User from '../../models/User';

export default defineEventHandler(async (event) => {
  try {
    console.log('[INVITES API] Request received');
    
    const user = await getUserFromEvent(event);
    console.log('[INVITES API] User from event:', user ? `${user.email} (${user.role})` : 'null');
    
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: 'Authentication required' });
    }

    // Check if user is organization admin
    if (user.role !== 'organization_admin') {
      console.log('[INVITES API] User is not organization_admin, role:', user.role);
      throw createError({ statusCode: 403, statusMessage: 'Only organization admins can view invites' });
    }

    const organizationId = user.organizationId;
    console.log('[INVITES API] Organization ID:', organizationId);
    
    if (!organizationId) {
      throw createError({ statusCode: 403, statusMessage: 'No organization associated' });
    }

    // Fetch invites for the organization with populated data
    console.log('[INVITES API] Fetching invites for organization:', organizationId);
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

    console.log('[INVITES API] Found invites count:', invites.length);

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

    console.log('[INVITES API] Returning formatted invites');
    return {
      success: true,
      invites: formattedInvites
    };
  } catch (error: any) {
    console.error('[INVITES API] Error:', error);
    console.error('[INVITES API] Error statusCode:', error.statusCode);
    console.error('[INVITES API] Error statusMessage:', error.statusMessage);
    throw error.statusCode ? error : createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch invites'
    });
  }
});
