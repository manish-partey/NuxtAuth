// server/api/org/users/[id]/toggle-status.post.ts
import { defineEventHandler, getRouterParam, createError } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import User from '~/server/models/User';

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await getUserFromEvent(event);
    
    // Only organization_admin can toggle user status
    if (!currentUser || currentUser.role !== 'organization_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only organization admins can pause/resume users'
      });
    }

    const userId = getRouterParam(event, 'id');
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      });
    }

    // Verify the target user belongs to the same organization
    if (targetUser.organizationId?.toString() !== currentUser.organizationId?.toString()) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only manage users in your organization'
      });
    }

    // Cannot pause/resume yourself
    if (targetUser._id.toString() === currentUser.id.toString()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'You cannot pause/resume your own account'
      });
    }

    // Cannot pause/resume other organization admins
    if (targetUser.role === 'organization_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'You cannot pause/resume other organization admins'
      });
    }

    // Toggle status: active <-> suspended
    const newStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    targetUser.status = newStatus;
    await targetUser.save();

    console.log(`[USER-TOGGLE-STATUS] User ${targetUser.email} status changed to ${newStatus} by org admin ${currentUser.email}`);

    return {
      success: true,
      message: `User ${newStatus === 'suspended' ? 'paused' : 'resumed'} successfully`,
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        status: targetUser.status
      }
    };
  } catch (err: any) {
    console.error('[USER-TOGGLE-STATUS] Error:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to toggle user status'
    });
  }
});
