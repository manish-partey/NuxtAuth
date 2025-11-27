// server/api/user/me.get.ts
import { defineEventHandler, setResponseStatus } from 'h3';
import User from '~/server/models/User';
import { requireAuth } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);

    const populatedUser = await User.findById(user.id)
      .populate('organizationId')
      .populate('platformId')
      .lean();

    if (!populatedUser) {
      setResponseStatus(event, 404);
      return { message: 'User not found' };
    }

    return {
      user: {
        id: populatedUser._id.toString(),
        username: populatedUser.username,
        email: populatedUser.email,
        role: populatedUser.role,
        isVerified: populatedUser.isVerified,
        organization: populatedUser.organizationId
          ? {
              id: populatedUser.organizationId._id?.toString?.() || '',
              name: populatedUser.organizationId.name,
            }
          : null,
        platform: populatedUser.platformId
          ? {
              id: populatedUser.platformId._id?.toString?.() || '',
              name: populatedUser.platformId.name,
            }
          : null,
      },
    };
  } catch (error: any) {
    console.error('Error fetching user /api/user/me:', error);
    setResponseStatus(event, 500);
    return { message: 'Internal server error while fetching user data.' };
  }
});
