// /server/api/organization/create.post.ts
import { createOrganization } from '~/server/services/organization';
import { requireRole } from '~/server/middleware/auth';

export default defineEventHandler(async (event) => {
  // Allow only super_admin or platform_admin to create orgs
  await requireRole(['super_admin', 'platform_admin'])(event);

  const body = await readBody(event);
  const { name, platformId } = body;

  if (!name || !platformId) {
    throw createError({ statusCode: 400, statusMessage: 'Organization name and platformId are required' });
  }

  try {
    const organization = await createOrganization({
      name,
      platformId,
      createdByUserId: event.context.user.id,
    });
    return { success: true, organization };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to create organization' };
  }
});
