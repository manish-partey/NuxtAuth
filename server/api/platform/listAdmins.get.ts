// server/api/platform/listAdmins.get.ts
import { listPlatformAdmins } from '~/server/services/platform';
import { requireRole } from '~/server/middleware/auth';

import { defaultClient } from 'applicationinsights';

export default defineEventHandler(async (event) => {
  try {
  await requireRole(['super_admin', 'platform_admin'])(event);

  const platformId = getQuery(event).platformId as string;

  if (!platformId) {
    return {
      success: false,
      message: 'platformId query parameter is required'
    };
  }

  try {
    const platforms = await listPlatformAdmins(platformId);

    const formatted = platforms.map((platform: any) => ({
      _id: platform._id,
      name: platform.name,
      createdAt: platform.createdAt,
      admins: Array.isArray(platform.admins)
        ? platform.admins.map((admin: any) => ({ email: admin.email }))
        : []
    }));

    return {
      success: true,
      data: formatted
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to fetch platform admins.'
    };
  }
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});
