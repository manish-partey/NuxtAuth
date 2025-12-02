import Invite from '../../../models/Invite';
import Organization from '../../../models/Organization';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { token } = query;

    if (!token || typeof token !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invitation token is required'
      });
    }

    // Find the invite by token
    const invite = await Invite.findOne({ 
      token,
      status: 'pending',
      revoked: { $ne: true },
      expiresAt: { $gt: new Date() }
    }).populate('organizationId', 'name');

    if (!invite) {
      // Check for expired or used invites to provide better error messages
      const expiredInvite = await Invite.findOne({ token });
      
      if (expiredInvite) {
        if (expiredInvite.status === 'accepted') {
          throw createError({
            statusCode: 400,
            statusMessage: 'This invitation has already been accepted'
          });
        }
        if (expiredInvite.revoked) {
          throw createError({
            statusCode: 400,
            statusMessage: 'This invitation has been revoked'
          });
        }
        if (expiredInvite.expiresAt < new Date()) {
          throw createError({
            statusCode: 400,
            statusMessage: 'This invitation has expired'
          });
        }
      }
      
      throw createError({
        statusCode: 404,
        statusMessage: 'Invalid invitation token'
      });
    }

    return {
      success: true,
      invitation: {
        email: invite.email,
        role: invite.role,
        organizationName: (invite.organizationId as any)?.name || 'Unknown Organization',
        inviterName: invite.inviterName,
        createdAt: invite.createdAt
      }
    };

  } catch (error) {
    console.error('[VERIFY_INVITE] Error:', error);
    
    if (error instanceof Error && 'statusCode' in error) {
      throw error; // Re-throw createError errors
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to verify invitation'
    });
  }
});