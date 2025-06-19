// server/api/user/me.get.ts
import { defineEventHandler, setResponseStatus } from 'h3';
import User from '~/server/models/User';

export default defineEventHandler(async (event) => {
  const userId = event.context.user?.userId;
  if (!userId) {
    setResponseStatus(event, 401);
    return { message: 'Unauthorized: User not found in context' };
  }

  try {
    const user = await User.findById(userId)
      .populate('organizationId')
      .populate('platformId')
      .lean();

    if (!user) {
      setResponseStatus(event, 404);
      return { message: 'User not found' };
    }

    return {
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        organization: user.organizationId
          ? {
              id: user.organizationId._id?.toString?.() || '',
              name: user.organizationId.name,
            }
          : null,
        platform: user.platformId
          ? {
              id: user.platformId._id?.toString?.() || '',
              name: user.platformId.name,
            }
          : null,
      }
    };
  } catch (error: any) {
    console.error('Error fetching user /api/user/me:', error);
    setResponseStatus(event, 500);
    return { message: 'Internal server error while fetching user data.' };
  }
});
