// server/api/user/me.get.ts
import { defineEventHandler, setResponseStatus } from 'h3';
import { getAuthUserById } from '~/server/services/auth';

export default defineEventHandler(async (event) => {
  // User info should be attached to event.context.user by auth middleware
  const userId = event.context.user?.userId;
  if (!userId) {
    setResponseStatus(event, 401);
    return { message: 'Unauthorized: User not found in context' };
  }

  try {
    const user = await getAuthUserById(userId);

    if (!user) {
      setResponseStatus(event, 404);
      return { message: 'User not found' };
    }

    // Return user object inside a "user" property to match frontend expectations
    return {
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        organizationId: user.organizationId ? user.organizationId.toString() : null,
        platformId: user.platformId ? user.platformId.toString() : null,
      }
    };
  } catch (error: any) {
    console.error('Error fetching user /api/user/me:', error);
    setResponseStatus(event, 500);
    return { message: 'Internal server error while fetching user data.' };
  }
});
