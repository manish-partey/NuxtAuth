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
      .select('_id name email role organizationId platformId status disabled')
      .lean();

    // Manually populate organization names
    const Organization = (await import('~/server/models/Organization')).default;
    const orgIds = users.map(u => u.organizationId).filter(Boolean);
    const organizations = await Organization.find({ _id: { $in: orgIds } }).select('_id name').lean();
    const orgMap = new Map(organizations.map(org => [String(org._id), org.name]));

    const formatted = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      disabled: user.disabled,
      platformId: user.platformId ? user.platformId.toString() : null,
      organization: user.organizationId 
        ? {
            _id: user.organizationId.toString(),
            name: orgMap.get(user.organizationId.toString()) || 'N/A',
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
