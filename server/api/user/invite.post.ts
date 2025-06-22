// /server/api/user/invite.post.ts
import { inviteUser } from '~/server/services/user';
import { getUserFromEvent } from '~/server/utils/auth';

import { defaultClient } from 'applicationinsights';

export default defineEventHandler(async (event) => {
  try {
  const user = await getUserFromEvent(event);
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  const body = await readBody(event);
  const { email, name, role, organizationId, platformId } = body;

  // Validate roles allowed to be invited based on inviter role
  // Define allowed roles per inviter role to control who can assign what role
  const allowedRolesForInviter = {
    'super_admin': ['super_admin', 'platform-admin', 'organization-admin', 'admin', 'user'],
    'platform-admin': ['organization-admin', 'admin', 'user'],  // Can invite org admins or lower under their platform
    'organization-admin': ['admin', 'user'],  // Can invite users/admins within their org only
  };

  if (user.role === 'super_admin') {
    // super_admin can invite anyone anywhere, no restrictions
  } else if (user.role === 'platform-admin') {
    // platform-admin: invite users/org-admins only under their platform
    if (platformId !== user.platformId) {
      throw createError({ statusCode: 403, message: 'Cannot invite users to other platforms' });
    }
    if (!allowedRolesForInviter['platform-admin'].includes(role)) {
      throw createError({ statusCode: 403, message: 'Role not allowed to be assigned by platform admin' });
    }
  } else if (user.role === 'organization-admin') {
    // org admin: invite users/admins only within their org
    if (organizationId !== user.organizationId) {
      throw createError({ statusCode: 403, message: 'Cannot invite users to other organizations' });
    }
    if (!allowedRolesForInviter['organization-admin'].includes(role)) {
      throw createError({ statusCode: 403, message: 'Role not allowed to be assigned by organization admin' });
    }
  } else {
    throw createError({ statusCode: 403, message: 'Insufficient permissions to invite users' });
  }

  try {
    const invitedUser = await inviteUser({ email, name, role, organizationId, platformId });
    return { success: true, invitedUser };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});
