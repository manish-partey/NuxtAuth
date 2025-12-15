// server/api/platform/[id].ts
import { defineEventHandler, createError } from 'h3';
import Platform from '~/server/models/Platform';
import { getUserFromEvent } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
  const user = await getUserFromEvent(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const id = event.context.params?.id;

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Platform ID is required' });
  }

  // Super admin can access any platform
  // Platform admin can only access their own platform
  if (user.role === 'platform_admin' && user.platformId?.toString() !== id) {
    throw createError({ statusCode: 403, statusMessage: 'Access denied to this platform' });
  } else if (user.role !== 'super_admin' && user.role !== 'platform_admin') {
    throw createError({ statusCode: 403, statusMessage: 'Insufficient permissions' });
  }

  const platform = await Platform.findById(id).lean();

  if (!platform) {
    throw createError({ statusCode: 404, statusMessage: 'Platform not found' });
  }

  return {
    success: true,
    platform
  };
  } catch (err) {
    console.error('Error in platform [id].ts:', err);
    throw err;
  }
});