// server/api/admin/organization-types/pending.get.ts
import { defineEventHandler } from 'h3';
import { requireRole } from '~/server/utils/auth';
import OrganizationType from '~/server/models/OrganizationType';

export default defineEventHandler(async (event) => {
  await requireRole(event, ['super_admin']);
  
  const pendingTypes = await OrganizationType.find({
    status: 'pending_approval'
  })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name email role')
    .populate('platformId', 'name category')
    .lean();
  
  return {
    success: true,
    organizationTypes: pendingTypes,
    count: pendingTypes.length
  };
});
