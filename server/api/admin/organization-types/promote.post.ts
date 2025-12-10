// server/api/admin/organization-types/promote.post.ts
import { defineEventHandler, readBody, createError } from 'h3';
import { requireRole } from '~/server/utils/auth';
import OrganizationType from '~/server/models/OrganizationType';
import Organization from '~/server/models/Organization';
import { logAudit } from '~/server/services/audit';
import { invalidateOrgTypeCache } from '~/server/utils/cache';
import { notifyTypePromotion } from '~/server/services/orgtype-notifications';

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['super_admin']);
  const body = await readBody(event);
  const { typeId, mergeWithGlobalId } = body;
  
  const platformType = await OrganizationType.findById(typeId);
  
  if (!platformType) {
    throw createError({ 
      statusCode: 404, 
      statusMessage: 'Organization type not found' 
    });
  }
  
  if (platformType.scope !== 'platform') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Only platform-specific types can be promoted'
    });
  }
  
  // Check for naming conflicts
  const existingGlobal = mergeWithGlobalId 
    ? await OrganizationType.findById(mergeWithGlobalId)
    : await OrganizationType.findOne({
        code: platformType.code,
        scope: 'global'
      });
  
  if (existingGlobal && mergeWithGlobalId) {
    // Merge: Update all orgs to use global type
    const orgCount = await Organization.countDocuments({ type: platformType._id });
    
    await Organization.updateMany(
      { type: platformType._id },
      { $set: { type: existingGlobal._id } }
    );
    
    // Mark platform type as inactive
    platformType.status = 'inactive';
    platformType.active = false;
    await platformType.save();
    
    // Log audit
    await logAudit({
      action: 'PROMOTE_ORG_TYPE',
      entityType: 'OrganizationType',
      entityId: platformType._id.toString(),
      userId: user.id,
      details: {
        action: 'merge',
        fromType: platformType.code,
        toType: existingGlobal.code,
        organizationsMigrated: orgCount
      },
      event
    });
    
    // Invalidate cache
    invalidateOrgTypeCache();
    
    // #8 - Send merge notification
    notifyTypePromotion(platformType._id.toString(), 'merged', existingGlobal._id.toString()).catch(err =>
      console.error('Failed to send merge notification:', err)
    );
    
    return {
      success: true,
      message: `Merged ${orgCount} organizations to global type "${existingGlobal.name}"`,
      action: 'merged',
      organizationCount: orgCount
    };
  } else if (!existingGlobal) {
    // Promote: Convert to global
    platformType.scope = 'global';
    platformType.platformId = null;
    platformType.status = 'active';
    platformType.active = true;
    platformType.approvedBy = user.id;
    platformType.approvedAt = new Date();
    await platformType.save();
    
    // Log audit
    await logAudit({
      action: 'PROMOTE_ORG_TYPE',
      entityType: 'OrganizationType',
      entityId: platformType._id.toString(),
      userId: user.id,
      details: {
        action: 'promote',
        code: platformType.code,
        name: platformType.name
      },
      event
    });
    
    // Invalidate cache
    invalidateOrgTypeCache();
    
    // #8 - Send promotion notification
    notifyTypePromotion(platformType._id.toString(), 'promoted').catch(err =>
      console.error('Failed to send promotion notification:', err)
    );
    
    return {
      success: true,
      message: `Promoted "${platformType.name}" to global type`,
      action: 'promoted',
      organizationType: platformType
    };
  } else {
    throw createError({
      statusCode: 409,
      statusMessage: `Global type "${existingGlobal.name}" already exists. Please use mergeWithGlobalId to merge.`
    });
  }
});
