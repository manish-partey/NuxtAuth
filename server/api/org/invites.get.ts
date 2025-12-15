import { defineEventHandler, createError } from 'h3';
import { getUserFromEvent } from '../../utils/auth';
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

    // Fetch users with invitation_sent status
    console.log('[INVITES API] Fetching invited users for organization:', organizationId);
    const invitedUsers = await User.find({ 
      organizationId,
      status: 'invitation_sent'
    })
    .select('_id email name role status createdAt resetPasswordExpiry resetPasswordToken')
    .sort({ createdAt: -1 })
    .lean();

    console.log('[INVITES API] Found invited users count:', invitedUsers.length);

    // Format the response
    const formattedInvites = invitedUsers.map((invitedUser: any) => ({
      _id: invitedUser._id.toString(),
      email: invitedUser.email,
      name: invitedUser.name,
      role: invitedUser.role,
      status: invitedUser.status,
      inviterName: user.name || 'Organization Admin',
      createdAt: invitedUser.createdAt,
      emailSentAt: invitedUser.createdAt, // When user was created, invitation was sent
      expiresAt: invitedUser.resetPasswordExpiry,
      hasToken: !!invitedUser.resetPasswordToken,
      isExpired: invitedUser.resetPasswordExpiry ? new Date(invitedUser.resetPasswordExpiry) < new Date() : false
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
