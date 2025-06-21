// /server/api/user/update.post.ts
import User from '~/server/models/User';
import { requireRole } from '~/server/middleware/auth';

export default defineEventHandler(async (event) => {
  await requireRole(['super_admin', 'platform_admin', 'organization_admin'])(event);

  const body = await readBody(event);
  const { userId, name, email, role } = body;

  if (!userId) throw createError({ statusCode: 400, statusMessage: 'userId is required' });

  const currentUser = event.context.user;

  // Fetch the user to update
  const userToUpdate = await User.findById(userId);
  if (!userToUpdate) throw createError({ statusCode: 404, statusMessage: 'User not found' });

  // Permission check - e.g. organization_admin can only update users in their org, cannot change role higher than their own
  if (currentUser.role === 'organization_admin' && userToUpdate.organizationId?.toString() !== currentUser.organizationId) {
    throw createError({ statusCode: 403, statusMessage: 'Not authorized to update this user' });
  }

  // Update allowed fields
  if (name) userToUpdate.name = name;
  if (email) userToUpdate.email = email;
  if (role && ['organization_admin', 'user'].includes(role)) {
    // Only super_admin or platform_admin can change roles
    if (currentUser.role === 'super_admin' || currentUser.role === 'platform_admin') {
      userToUpdate.role = role;
    } else {
      throw createError({ statusCode: 403, statusMessage: 'Not authorized to change role' });
    }
  }

  await userToUpdate.save();

  return { success: true, user: userToUpdate };
});
