// server/api/user/index.get.ts
import User from '../../models/User';
import { getUserFromEvent } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromEvent(event);

    if (!user || user.role !== 'admin') {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: Admin access required.' });
    }

    const users = await User.find({}, 'name email role isVerified'); // Select specific fields
    return { users: users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role, isVerified: u.isVerified })) };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal server error.', data: error.message });
  }
});