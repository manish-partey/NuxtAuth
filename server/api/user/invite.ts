// server/api/user/invite.ts

import { H3Event, sendError } from 'h3';
import { getAuthUserById, registerUser } from '~/server/services/auth';
import { verifyJwtToken } from '~/server/utils/auth'; // Utility to get user from token
import User from '~/server/models/User';

export default async function handler(event: H3Event) {
  try {
    // Step 1: Extract and verify the Authorization token (JWT)
    const authHeader = event.node.req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return sendError(event, createError({ statusCode: 401, statusMessage: 'Authorization token missing' }));
    }

    const authUserId = verifyJwtToken(token);
    if (!authUserId) {
      return sendError(event, createError({ statusCode: 401, statusMessage: 'Invalid or expired token' }));
    }

    // Step 2: Get the authenticated user details
    const authUser = await getAuthUserById(authUserId);
    if (!authUser) {
      return sendError(event, createError({ statusCode: 401, statusMessage: 'User not found' }));
    }

    // Step 3: Parse incoming POST JSON body for invitee details
    const body = await useBody(event);
    const { username, email, password, role, organizationId, platformId } = body;

    if (!username || !email || !password || !role) {
      return sendError(event, createError({ statusCode: 400, statusMessage: 'Missing required fields' }));
    }

    // Step 4: Call service method with inviter's role and relevant IDs
    // Ensure platformId and organizationId are passed if available or relevant
    const newUser = await registerUser({
      username,
      email,
      password,
      role,
      platformId: platformId || (authUser.platform ? authUser.platform.toString() : undefined),
      organizationId: organizationId || (authUser.organization ? authUser.organization.toString() : undefined),
      invitedByRole: authUser.role,
    });

    // Step 5: Respond with the newly created user info (omit sensitive info)
    return {
      success: true,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        platform: newUser.platform,
        organization: newUser.organization,
      },
    };
  } catch (error: any) {
    return sendError(event, createError({ statusCode: 400, statusMessage: error.message || 'Failed to invite user' }));
  }
}
