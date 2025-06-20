import User from '~/server/models/User';
import { requireRole } from '~/server/middleware/auth';

export default defineEventHandler(async (event) => {
  // Corrected usage: pass event and roles as separate params
  await requireRole(event, ['super_admin', 'platform_admin', 'organization_admin']);

  const url = new URL(event.req.url!, `http://${event.req.headers.host}`);
  const organizationId = url.searchParams.get('organizationId');

  const currentUser = event.context.user;

  const query: any = {};

  if (organizationId) {
    query.organizationId = organizationId;
  }

  if (currentUser.role === 'organization_admin') {
    query.organizationId = currentUser.organizationId;
  }

  try {
    const users = await User.find(query)
      .select('_id name email role organizationId')
      .populate('organizationId', 'name')
      .lean();

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
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      success: false,
      message: 'Failed to load users'
    };
  }
});
