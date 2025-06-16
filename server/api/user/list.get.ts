// /server/api/user/list.get.ts
import User from '~/server/models/User';
import { requireRole } from '~/server/middleware/auth';

export default defineEventHandler(async (event) => {
  await requireRole(['super_admin', 'platform_admin', 'org_admin'])(event);

  const url = new URL(event.req.url!, `http://${event.req.headers.host}`);
  const organizationId = url.searchParams.get('organizationId');

  const query: any = {};
  if (organizationId) query.organizationId = organizationId;

  // Restrict org_admins to their own organization
  const currentUser = event.context.user;
  if (currentUser.role === 'org_admin') {
    query.organizationId = currentUser.organizationId;
  }

  const users = await User.find(query)
    .select('_id name email role organizationId')
    .populate('organizationId', 'name')
    .exec();

  const formatted = users.map(user => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    organization: user.organizationId
      ? { name: user.organizationId.name }
      : null
  }));

  return { success: true, users: formatted };
});
