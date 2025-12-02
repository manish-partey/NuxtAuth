import crypto from 'crypto';
import { getUserFromEvent } from '../../utils/auth';
import Invite from '../../models/Invite';
import User from '../../models/User';
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

    // Get request body
    const body = await readBody(event);
    const { email, role = 'user' } = body;

    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email format'
      });
    }

    // Validate role
    const allowedRoles = ['user', 'admin'];
    if (!allowedRoles.includes(role)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid role specified'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'User with this email already exists'
      });
    }

    // Check if there's already a pending invite for this email in this organization
    const existingInvite = await Invite.findOne({
      email: email.toLowerCase(),
      organizationId: user.organizationId,
      status: 'pending',
      revoked: { $ne: true }
    });

    if (existingInvite) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Pending invite already exists for this email'
      });
    }

    // Generate unique invite token
    const token = crypto.randomBytes(32).toString('hex');

    // Create the invite
    const invite = new Invite({
      email: email.toLowerCase(),
      role,
      organizationId: user.organizationId,
      inviterUserId: user.id,
      inviterName: user.name,
      token,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    await invite.save();

    // Get organization details for email
    const organization = await Organization.findById(user.organizationId);

    // TODO: Send email notification here
    // For now, we'll just log the invite details
    console.log(`[INVITE] Created invite for ${email} to join organization ${organization?.name || 'Unknown'}`);
    console.log(`[INVITE] Invite token: ${token}`);
    console.log(`[INVITE] Accept URL: ${process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/accept-invite?token=${token}`);

    return {
      success: true,
      message: 'Invite sent successfully',
      invite: {
        _id: invite._id,
        email: invite.email,
        role: invite.role,
        status: invite.status,
        createdAt: invite.createdAt
      }
    };

  } catch (error) {
    console.error('[INVITE_POST] Error:', error);
    
    if (error instanceof Error && 'statusCode' in error) {
      throw error; // Re-throw createError errors
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send invite'
    });
  }
});