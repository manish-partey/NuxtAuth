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
        id: (populatedUser as any)._id.toString(),
        username: (populatedUser as any).username,
        email: (populatedUser as any).email,
        role: (populatedUser as any).role,
        isVerified: (populatedUser as any).isVerified,
        organization: (populatedUser as any).organizationId
          ? {
              id: (populatedUser as any).organizationId._id?.toString?.() || '',
              name: (populatedUser as any).organizationId.name,
            }
          : null,
        platform: (populatedUser as any).platformId
          ? {
              id: (populatedUser as any).platformId._id?.toString?.() || '',
              name: (populatedUser as any).platformId.name,
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
