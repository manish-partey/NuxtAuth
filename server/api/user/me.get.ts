// server/api/user/me.get.ts
import { defineEventHandler, setResponseStatus } from 'h3';
import User from '~/server/models/User';
import { getUserFromEvent } from '~/server/utils/auth';

import { defaultClient } from 'applicationinsights';

export default defineEventHandler(async (event) => {
  try {
  try {
    const user = await getUserFromEvent(event);

    if (!user) {
      setResponseStatus(event, 401);
      return { message: 'Unauthorized: User not found or invalid token' };
    }

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
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});
