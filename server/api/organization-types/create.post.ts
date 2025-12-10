// server/api/organization-types/create.post.ts
import { defineEventHandler, readBody, createError } from 'h3';
import { requireAuth } from '~/server/utils/auth';
import OrganizationType from '~/server/models/OrganizationType';
import Platform from '~/server/models/Platform';
import { 
  getOrgTypeManagementMode, 
  isOrgTypeApprovalRequired,
  getOrgTypeRateLimit 
} from '~/server/services/config';
import { logAudit } from '~/server/services/audit';
import { invalidateOrgTypeCache } from '~/server/utils/cache';
import { notifySuperAdminsNewType } from '~/server/services/orgtype-notifications';

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const body = await readBody(event);
  
  const mode = await getOrgTypeManagementMode();
  const requiresApproval = await isOrgTypeApprovalRequired();
  const rateLimit = await getOrgTypeRateLimit();
  
  // Rate limiting check
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentTypes = await OrganizationType.countDocuments({
    createdBy: user.id,
    createdAt: { $gte: oneDayAgo }
  });
  
  if (recentTypes >= rateLimit) {
    throw createError({
      statusCode: 429,
      statusMessage: `Rate limit exceeded: Maximum ${rateLimit} organization types per day`
    });
  }
  
  let scope: 'global' | 'platform' = 'global';
  let status: 'active' | 'pending_approval' = 'active';
  let platformId = null;
  
  // CENTRALIZED MODE: Only super admins can create
  if (mode === 'centralized') {
    if (user.role !== 'super_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only super admins can create organization types in centralized mode'
      });
    }
    scope = 'global';
    status = 'active';
  }
  
  // DECENTRALIZED MODE: Platform admins can create
  else if (mode === 'decentralized') {
    if (user.role === 'super_admin') {
      scope = 'global';
      status = 'active';
    } else if (user.role === 'platform_admin') {
      scope = 'platform';
      platformId = user.platformId;
      
      // Check if platform has auto-approval enabled
      const platform = await Platform.findById(platformId);
      if (platform?.autoApproveTypes) {
        status = 'active';
      } else {
        status = requiresApproval ? 'pending_approval' : 'active';
      }
    } else {
      throw createError({
        statusCode: 403,
        statusMessage: 'Insufficient permissions to create organization types'
      });
    }
  }
  
  // Check for duplicate code within scope
  const existing = await OrganizationType.findOne({
    code: body.code.toLowerCase(),
    scope,
    ...(scope === 'platform' && { platformId })
  });
  
  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: `Organization type with code "${body.code}" already exists in this scope`
    });
  }
  
  // Check for similar global types (suggestions)
  const similarGlobal = await OrganizationType.find({
    code: { $regex: new RegExp(body.code, 'i') },
    scope: 'global',
    status: 'active'
  }).limit(5);
  
  // Create the organization type
  const orgType = await OrganizationType.create({
    code: body.code.toLowerCase(),
    name: body.name,
    description: body.description,
    category: body.category,
    icon: body.icon || 'building',
    scope,
    platformId,
    status,
    justification: body.justification || '',
    createdBy: user.id,
    active: status === 'active',
  });
  
  // Log audit
  await logAudit({
    action: 'CREATE_ORG_TYPE',
    entityType: 'OrganizationType',
    entityId: orgType._id.toString(),
    userId: user.id,
    platformId: platformId?.toString(),
    details: {
      code: orgType.code,
      name: orgType.name,
      scope,
      status
    },
    event
  });
  
  const responseMessage = status === 'pending_approval'
    ? 'Organization type created and pending super admin approval'
    : 'Organization type created successfully';
  
  // Invalidate cache for this platform
  invalidateOrgTypeCache(platformId?.toString());
  
  // #8 - Send email notification if pending approval
  if (status === 'pending_approval') {
    notifySuperAdminsNewType(orgType._id.toString()).catch(err => 
      console.error('Failed to send notification:', err)
    );
  }
  
  return {
    success: true,
    organizationType: orgType,
    message: responseMessage,
    suggestions: similarGlobal.length > 0 ? similarGlobal : null
  };
});
