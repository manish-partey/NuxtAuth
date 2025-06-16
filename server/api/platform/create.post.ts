// /server/api/platform/create.post.ts
import { createPlatform } from '~/server/services/platform';
import { requireRole } from '~/server/middleware/auth';

export default defineEventHandler(async (event) => {
  try {
    // Enforce role permission upfront
    await requireRole(['super_admin'])(event);

    const body = await readBody(event);
    const { name } = body;

    // Basic validation for name
    if (!name || typeof name !== 'string' || !name.trim()) {
      return { success: false, message: 'Platform name is required' };
    }

    const platform = await createPlatform({ name: name.trim(), createdByUserId: event.context.user.id });
    return { success: true, platform };
  } catch (err: any) {
    // Log error here if logging system available
    return { success: false, message: err.message || 'Failed to create platform' };
  }
});
