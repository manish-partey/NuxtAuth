// server/api/user/index.get.ts
import User from '../../models/User';
import { getUserFromEvent } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromEvent(event);
    console.log('[DEBUG] getUserFromEvent:', user);
    if (!user || user.role !== 'admin') {
      console.warn('Forbidden access attempt by:', user);
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: Admin access required.' });
    }

    // Return limited user fields (excluding passwords)
    const users = await User.find({}, 'username name email role isVerified');

    return {
      users: users.map(u => ({
        id: u._id,
        username: u.username,
        name: u.name,
        email: u.email,
        role: u.role,
        isVerified: u.isVerified
      }))
    };
  } catch (error: any) {
    console.error('Error fetching users:', error);
    if (error.statusCode) throw error;

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error.',
      data: error.message || 'Unexpected server error'
    });
  }
});
