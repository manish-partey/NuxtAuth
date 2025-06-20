// server/api/platform/[id].ts
import { defineEventHandler, createError } from 'h3';
import Platform from '~/server/models/Platform';
import { getUserFromEvent } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event);
  if (!user || user.role !== 'super_admin') {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const id = event.context.params?.id;

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Platform ID is required' });
  }

  const platform = await Platform.findById(id).lean();

  if (!platform) {
    throw createError({ statusCode: 404, statusMessage: 'Platform not found' });
  }

  return platform;
});