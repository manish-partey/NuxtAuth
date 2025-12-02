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

    // Check if invite can be revoked
    if (invite.status === 'accepted') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot revoke accepted invite'
      });
    }

    if (invite.revoked) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invite is already revoked'
      });
    }

    // Revoke the invite
    invite.status = 'revoked';
    invite.revoked = true;
    await invite.save();

    console.log(`[INVITE_REVOKE] Revoked invite for ${invite.email}`);

    return {
      success: true,
      message: 'Invite revoked successfully'
    };

  } catch (error) {
    console.error('[INVITE_REVOKE] Error:', error);
    
    if (error instanceof Error && 'statusCode' in error) {
      throw error; // Re-throw createError errors
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to revoke invite'
    });
  }
});