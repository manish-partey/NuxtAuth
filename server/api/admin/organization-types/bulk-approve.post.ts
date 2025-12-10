// server/api/admin/organization-types/bulk-approve.post.ts
// #3 - Bulk Approval for Admin Efficiency
import { defineEventHandler, readBody, createError } from 'h3';
import { requireRole } from '~/server/utils/auth';
import OrganizationType from '~/server/models/OrganizationType';
import { logAudit } from '~/server/services/audit';

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['super_admin']);
  const body = await readBody(event);
  const { typeIds, action, rejectionReason } = body;
  
  if (!typeIds || !Array.isArray(typeIds) || typeIds.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'typeIds array is required'
    });
  }
  
  if (!action || !['approve', 'reject'].includes(action)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'action must be "approve" or "reject"'
    });
  }
  
  // Fetch all types
  const orgTypes = await OrganizationType.find({
    _id: { $in: typeIds },
    status: 'pending_approval'
  });
  
  if (orgTypes.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'No pending types found with the provided IDs'
    });
  }
  
  const results: {
    approved: number;
    rejected: number;
    failed: Array<{ typeId: any; name: string; error: string }>;
    skipped: number;
  } = {
    approved: 0,
    rejected: 0,
    failed: [],
    skipped: 0
  };
  
  for (const orgType of orgTypes) {
    try {
      if (action === 'approve') {
        orgType.status = 'active';
        orgType.active = true;
        orgType.approvedBy = user.id;
        orgType.approvedAt = new Date();
        await orgType.save();
        
        results.approved++;
        
        // Log audit
        await logAudit({
          action: 'APPROVE_ORG_TYPE',
          entityType: 'OrganizationType',
          entityId: orgType._id.toString(),
          userId: user.id,
          platformId: orgType.platformId?.toString(),
          details: {
            code: orgType.code,
            name: orgType.name,
            bulkOperation: true
          },
          event
        });
      } else if (action === 'reject') {
        orgType.rejectionReason = rejectionReason || 'Bulk rejection';
        orgType.status = 'inactive';
        orgType.active = false;
        await orgType.save();
        
        results.rejected++;
        
        // Log audit
        await logAudit({
          action: 'REJECT_ORG_TYPE',
          entityType: 'OrganizationType',
          entityId: orgType._id.toString(),
          userId: user.id,
          platformId: orgType.platformId?.toString(),
          details: {
            code: orgType.code,
            name: orgType.name,
            reason: rejectionReason,
            bulkOperation: true
          },
          event
        });
      }
    } catch (error: any) {
      results.failed.push({
        typeId: orgType._id,
        name: orgType.name,
        error: error.message
      });
    }
  }
  
  // Check for skipped IDs
  results.skipped = typeIds.length - (results.approved + results.rejected + results.failed.length);
  
  return {
    success: true,
    message: `Bulk ${action} completed`,
    results
  };
});
