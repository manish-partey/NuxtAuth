// /server/api/user/invite.get.ts

import User from '~/server/models/User';
import { requireRole } from '~/server/middleware/auth';

export default defineEventHandler(async (event) => {
  await requireRole(['super_admin', 'platform_admin', 'organization_admin'])(event);

  const url = new URL(event.req.url!, `http://${event.req.headers.host}`);
  const organizationId = url.searchParams.get('organizationId');

  const query: any = {
    invited: true, // assuming this flag marks invited (but not yet accepted) users
  };

  if (organizationId) {
    query.organizationId = organizationId;
  }

  const currentUser = event.context.user;
  if (currentUser.role === 'organization_admin') {
    query.organizationId = currentUser.organizationId;
  }

  const users = await User.find(query)
    .select('_id email role accepted createdAt organizationId')
    .populate('organizationId', 'name')
    .exec();

  const formatted = users.map(user => ({
    _id: user._id,
    email: user.email,
    role: user.role,
    accepted: user.accepted ?? false,
    createdAt: user.createdAt,
    organization: user.organizationId ? { name: user.organizationId.name } : null
  }));

  return { success: true, users: formatted };
});
