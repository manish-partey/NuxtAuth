// server/api/platform/assignAdmin.post.ts
import { assignPlatformAdmin } from '~/server/services/platform';
import { requireRole } from '~/server/middleware/auth';

import { defaultClient } from 'applicationinsights';

export default defineEventHandler(async (event) => {
  try {
  await requireRole(['super_admin', 'platform_admin'])(event);

  const body = await readBody(event);
  const { platformId, userId } = body;

  if (!platformId || !userId) {
    return { success: false, message: 'platformId and userId are required' };
  }

  try {
    const assignedUser = await assignPlatformAdmin(platformId, userId, event.context.user.id);
    return { success: true, user: assignedUser };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});
