import crypto from 'crypto';
import { getUserFromEvent } from '../../../utils/auth';
import Invite from '../../../models/Invite';

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

    // Get request body
    const body = await readBody(event);
    const { inviteId } = body;

    if (!inviteId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invite ID is required'
      });
    }

    // Find the invite and verify it belongs to user's organization
    const invite = await Invite.findOne({
      _id: inviteId,
      organizationId: user.organizationId
    });

    if (!invite) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Invite not found'
      });
    }

    // Check if invite can be resent
    if (invite.status !== 'pending') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Only pending invites can be resent'
      });
    }

    if (invite.revoked) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot resend revoked invite'
      });
    }

    // Generate new token and extend expiry
    const newToken = crypto.randomBytes(32).toString('hex');
    const newExpiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Update the invite
    invite.token = newToken;
    invite.expiresAt = newExpiryDate;
    await invite.save();

    // TODO: Send email notification here
    console.log(`[INVITE_RESEND] Resent invite for ${invite.email}`);
    console.log(`[INVITE_RESEND] New token: ${newToken}`);
    console.log(`[INVITE_RESEND] Accept URL: ${process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/accept-invite?token=${newToken}`);

    return {
      success: true,
      message: 'Invite resent successfully'
    };

  } catch (error) {
    console.error('[INVITE_RESEND] Error:', error);
    
    if (error instanceof Error && 'statusCode' in error) {
      throw error; // Re-throw createError errors
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to resend invite'
    });
  }
});