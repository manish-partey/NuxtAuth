//server/api/platform/assignAdmin.post.ts
import { removePlatformAdmin } from '~/server/services/platform';
import { requireRole } from '~/server/middleware/auth';

export default defineEventHandler(async (event) => {
  await requireRole(['super_admin', 'platform_admin'])(event);

  const body = await readBody(event);
  const { platformId, userId } = body;

  if (!platformId || !userId) {
    return { success: false, message: 'platformId and userId are required' };
  }

  try {
    const removedUser = await removePlatformAdmin(platformId, userId, event.context.user.id);
    return { success: true, user: removedUser };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
});
