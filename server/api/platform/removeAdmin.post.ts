//server/api/platform/removeAdmin.post.ts
import { readBody } from 'h3';
import { removePlatformAdmin } from '~/server/services/platform';
import { requireRole } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, ['super_admin', 'platform_admin']);

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
  } catch (err) {
    throw err;
  }
});
