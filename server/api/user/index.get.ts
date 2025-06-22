// server/api/user/index.get.ts
import User from '~/server/models/User';
import { getUserFromEvent } from '~/server/utils/auth';
import { getQuery, defineEventHandler, createError } from 'h3';

import { defaultClient } from 'applicationinsights';

export default defineEventHandler(async (event) => {
  try {
  try {
    const user = await getUserFromEvent(event);

    // Allow access only to elevated roles
    const allowedRoles = ['admin', 'super_admin', 'platform-admin', 'organization-admin'];
    if (!user || !allowedRoles.includes(user.role)) {
      console.warn('Forbidden access attempt by:', user?.email || 'unauthenticated user');
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: Admin access required.' });
    }

    // Pagination logic
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();
    const users = await User.find({}, 'username name email role isVerified')
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      page,
      limit,
      total: totalUsers,
      users: users.map(u => ({
        id: u._id.toString(),
        username: u.username,
        name: u.name,
        email: u.email,
        role: u.role,
        isVerified: u.isVerified,
      })),
    };
  } catch (error: any) {
    console.error('Error fetching users:', error);

    if (error?.statusCode) throw error;

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error.',
      data: error.message || 'Unexpected server error.',
    });
  }
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});
