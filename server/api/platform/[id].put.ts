// server/api/platform/[id].put.ts
import { defineEventHandler, readBody, createError } from 'h3';
import Platform from '~/server/models/Platform';
import { getUserFromEvent } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event);
  if (!user || user.role !== 'super_admin') {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const id = event.context.params?.id;
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing platform ID' });
  }

  const { name, description } = await readBody(event);

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Platform name is required' });
  }

  const updated = await Platform.findByIdAndUpdate(
    id,
    { name: name.trim(), description: description || '' },
    { new: true }
  );

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Platform not found' });
  }

  return {
    success: true,
    platform: updated,
  };
});
