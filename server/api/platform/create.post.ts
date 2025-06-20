// /server/api/platform/create.post.ts
import { readBody } from 'h3';
import { createPlatform } from '~/server/services/platform';
import { requireRole } from '~/server/middleware/auth';

export default defineEventHandler(async (event) => {
  try {
    // Enforce role permission upfront
    await requireRole(event, ['super_admin']);

    const body = await readBody(event);
    const { name, type } = body;

    // Validate name
    if (!name || typeof name !== 'string' || !name.trim()) {
      return { success: false, message: 'Platform name is required' };
    }

    // Validate type (optional: adjust allowed types if you want)
    const allowedTypes = ['grocery', 'college', 'doctor', 'hospital', 'other'];
    if (!type || typeof type !== 'string' || !allowedTypes.includes(type)) {
      return { success: false, message: 'Valid platform type is required' };
    }

    const platform = await createPlatform({
      name: name.trim(),
      type,
      createdByUserId: event.context.user.id,
    });

    return { success: true, platform };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to create platform' };
  }
});
