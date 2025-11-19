import { readBody, createError } from 'h3';
import User from '~/server/models/User';
import { getUserFromEvent } from '~/server/utils/auth';
import { z } from 'zod';

const updateSchema = z.object({
  userId: z.string(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['super_admin', 'platform_admin', 'organization_admin', 'user']).optional(),
  disabled: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await getUserFromEvent(event);
    if (!currentUser || !currentUser.role) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    // Check if user has required role
    const allowedRoles = ['super_admin', 'platform_admin', 'organization_admin', 'user'];
    if (!allowedRoles.includes(currentUser.role)) {
      throw createError({ statusCode: 403, statusMessage: 'Insufficient permissions' });
    }

    // Validate input
    const body = await readBody(event);
    const { userId, name, email, role, disabled } = updateSchema.parse(body);

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' });
    }

    // ✅ Prevent user from modifying themselves
    const currentUserId = currentUser.id?.toString?.() || currentUser.id || null;
    const isSelf = currentUserId && userId === currentUserId;

    if (isSelf) {
      if (role && role !== currentUser.role) {
        throw createError({ statusCode: 400, statusMessage: 'You cannot change your own role' });
      }
      if (disabled === true) {
        throw createError({ statusCode: 400, statusMessage: 'You cannot disable your own account' });
      }
    }

    // ✅ Compare orgs safely
    let sameOrg = false;
    if (userToUpdate.organizationId && currentUser.organizationId) {
      sameOrg =
        userToUpdate.organizationId.toString() === currentUser.organizationId.toString();
    }

    // ✅ Role-based enforcement
    switch (currentUser.role) {
      case 'super_admin':
        break;

      case 'platform_admin':
        if (userToUpdate.role === 'super_admin') {
          throw createError({ statusCode: 403, statusMessage: 'Cannot update Super Admins' });
        }
        break;

      case 'organization_admin':
        if (!sameOrg) {
          throw createError({ statusCode: 403, statusMessage: 'Cannot update users outside your organization' });
        }
        if (role && !['organization_admin', 'user'].includes(role)) {
          throw createError({ statusCode: 403, statusMessage: 'Cannot assign elevated roles' });
        }
        break;

      case 'user':
        if (!isSelf) {
          throw createError({ statusCode: 403, statusMessage: 'Users can only update their own profile' });
        }
        if (role || disabled !== undefined) {
          throw createError({ statusCode: 403, statusMessage: 'Users cannot change role or status' });
        }
        break;
    }

    // ✅ Apply updates
    if (name) userToUpdate.name = name;
    if (email) userToUpdate.email = email;
    if (role) userToUpdate.role = role;
    if (disabled !== undefined) userToUpdate.disabled = disabled;

    await userToUpdate.save();

    return { success: true, user: userToUpdate };
  } catch (err: any) {
    console.error('[ERROR] User update failed:', err);
    throw createError({
      statusCode: 500,
      statusMessage: err?.message || 'User update failed',
    });
  }
});
