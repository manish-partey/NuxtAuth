// server/api/user/update.post.ts
import { readBody, createError } from 'h3';
import User from '~/server/models/User';
import { requireRole } from '~/server/middleware/auth';

import { defaultClient } from 'applicationinsights';

export default defineEventHandler(async (event) => {
  try {
  await requireRole(event, ['super_admin', 'platform_admin', 'organization_admin', 'user']);

  const body = await readBody(event);
  const { userId, name, email, role } = body;

  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'userId is required' });
  }

  const currentUser = event.context.user;

  const userToUpdate = await User.findById(userId);
  if (!userToUpdate) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' });
  }

  // Only org admin can update within their org
  if (
    currentUser.role === 'organization_admin' &&
    userToUpdate.organizationId?.toString() !== currentUser.organizationId
  ) {
    throw createError({ statusCode: 403, statusMessage: 'Not authorized to update this user' });
  }

  // Users can only update their own record
  if (
    currentUser.role === 'user' &&
    userToUpdate._id.toString() !== currentUser.id
  ) {
    throw createError({ statusCode: 403, statusMessage: 'Users can only update their own profile' });
  }

  if (name) userToUpdate.name = name;
  if (email) userToUpdate.email = email;

  // Role change allowed only by super or platform admin
  if (role && ['organization_admin', 'user'].includes(role)) {
    if (['super_admin', 'platform_admin'].includes(currentUser.role)) {
      userToUpdate.role = role;
    } else {
      throw createError({ statusCode: 403, statusMessage: 'Not authorized to change role' });
    }
  }

  await userToUpdate.save();

  return { success: true, user: userToUpdate };
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});
