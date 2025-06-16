// /server/api/organization/listUsers.get.ts
import User from '~/server/models/User';
import { requireRole } from '~/server/middleware/auth';

export default defineEventHandler(async (event) => {
  // Only allow super_admin, platform_admin, org_admin
  await requireRole(['super_admin', 'platform_admin', 'org_admin'])(event);

  // Get orgId from query params
  const url = new URL(event.req.url!, `http://${event.req.headers.host}`);
  const organizationId = url.searchParams.get('organizationId');

  if (!organizationId) {
    throw createError({ statusCode: 400, statusMessage: 'organizationId query parameter is required' });
  }

  // Verify permissions
  const user = event.context.user;
  // platform_admin must belong to platform owning org, org_admin must belong to org
  if (user.role === 'platform_admin') {
    // TODO: optionally verify platform ownership if you want more strict check here
  } else if (user.role === 'org_admin') {
    if (user.organizationId !== organizationId) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: Not admin of this organization' });
    }
  }

  const users = await User.find({ organizationId }).select('-password -verificationToken -verificationTokenExpiry').exec();

  return { success: true, users };
});
