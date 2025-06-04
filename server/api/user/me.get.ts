import { defineEventHandler, setResponseStatus } from 'h3';
import { getAuthUserById } from '~/server/services/auth';

export default defineEventHandler(async (event) => {
  // This route is protected by `server/middleware/auth.ts`
  if (!event.context.user?.userId) {
    // This case should ideally not be reached if middleware is correctly applied
    setResponseStatus(event, 401);
    return { message: 'Unauthorized: User not found in context' };
  }

  try {
    const user = await getAuthUserById(event.context.user.userId);

    if (!user) {
      setResponseStatus(event, 404);
      return { message: 'User not found' };
    }

    return {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    };
  } catch (error: any) {
    console.error('Error fetching user /api/user/me:', error);
    setResponseStatus(event, 500);
    return { message: 'Internal server error while fetching user data.' };
  }
});
