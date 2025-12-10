// server/api/admin/organization-types/approve.post.ts
import { defineEventHandler, readBody, createError } from 'h3';
import { requireRole } from '~/server/utils/auth';
import OrganizationType from '~/server/models/OrganizationType';
import { logAudit } from '~/server/services/audit';
import { invalidateOrgTypeCache } from '~/server/utils/cache';
import { notifyPlatformAdminApproval } from '~/server/services/orgtype-notifications';

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['super_admin']);
  const body = await readBody(event);
  const { typeId, action, rejectionReason } = body;
  
  const orgType = await OrganizationType.findById(typeId);
  
  if (!orgType) {
    throw createError({ 
      statusCode: 404, 
      statusMessage: 'Organization type not found' 
    });
  }
  
  if (orgType.status !== 'pending_approval') {
    throw createError({
      statusCode: 400,
      statusMessage: 'This organization type is not pending approval'
    });
  }
  
  if (action === 'approve') {
    orgType.status = 'active';
    orgType.active = true;
    orgType.approvedBy = user.id;
    orgType.approvedAt = new Date();
    await orgType.save();
    
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
        scope: orgType.scope
      },
      event
    });
    
    // Invalidate cache
    invalidateOrgTypeCache(orgType.platformId?.toString());
    
    // #8 - Send approval notification
    notifyPlatformAdminApproval(orgType._id.toString(), true).catch((err: Error) =>
      console.error('Failed to send approval notification:', err)
    );
    
    return {
      success: true,
      message: 'Organization type approved successfully',
      organizationType: orgType
    };
  } else if (action === 'reject') {
    orgType.rejectionReason = rejectionReason || 'No reason provided';
    orgType.status = 'inactive';
    orgType.active = false;
    await orgType.save();
    
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
        reason: rejectionReason
      },
      event
    });
    
    // Invalidate cache
    invalidateOrgTypeCache(orgType.platformId?.toString());

    // #8 - Send rejection notification
    await notifyPlatformAdminApproval(orgType._id.toString(), false, rejectionReason).catch((err: Error) =>
      console.error('Failed to send rejection notification:', err)
    );
    
    return {
      success: true,
      message: 'Organization type rejected',
      rejectionReason
    };
  }
  
  throw createError({ 
    statusCode: 400, 
    statusMessage: 'Invalid action. Use "approve" or "reject"' 
  });
});
