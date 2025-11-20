// server/api/user/list.get.ts
import User from '~/server/models/User';
import { requireRole } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
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

    const users = await User.find(query)
      .select('_id name email role organizationId')
      .populate('organizationId', 'name _id') // ✅ Populate name
      .lean();

    const formatted = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organizationId && typeof user.organizationId === 'object'
        ? {
            _id: user.organizationId._id?.toString?.() || '',
            name: user.organizationId.name || 'N/A',
          }
        : null
    }));

    return { success: true, users: formatted };
  } catch (err) {
    console.error('Error in user list API:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Server Error',
      message: 'Failed to load users',
    });
  }
});
