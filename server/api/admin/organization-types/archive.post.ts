// server/api/admin/organization-types/archive.post.ts
// #10 - Soft Delete (Archive) instead of hard delete
import { defineEventHandler, readBody, createError } from 'h3';
import { requireRole } from '~/server/utils/auth';
import OrganizationType from '~/server/models/OrganizationType';
import { logAudit } from '~/server/services/audit';

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['super_admin']);
  const body = await readBody(event);
  const { typeId } = body;
  
  const orgType = await OrganizationType.findById(typeId);
  
  if (!orgType) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Organization type not found'
    });
  }
  
  // Check if it's being used
  if (orgType.usageCount > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Cannot archive "${orgType.name}" because it is being used by ${orgType.usageCount} organization(s). This prevents data corruption.`
    });
  }
  
  // Archive instead of delete
  orgType.status = 'archived';
  orgType.active = false;
  orgType.deletedAt = new Date();
  await orgType.save();
  
  // Log audit
  await logAudit({
    action: 'DELETE_ORG_TYPE',
    entityType: 'OrganizationType',
    entityId: orgType._id.toString(),
    userId: user.id,
    platformId: orgType.platformId?.toString(),
    details: {
      code: orgType.code,
      name: orgType.name,
      action: 'archived',
      usageCount: orgType.usageCount
    },
    event
  });
  
  return {
    success: true,
    message: `Organization type "${orgType.name}" has been archived`,
    organizationType: orgType
  };
});
