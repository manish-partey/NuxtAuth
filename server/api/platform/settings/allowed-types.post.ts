// server/api/platform/settings/allowed-types.post.ts
import { defineEventHandler, readBody, createError } from 'h3';
import { requireRole } from '~/server/utils/auth';
import Platform from '~/server/models/Platform';
import OrganizationType from '~/server/models/OrganizationType';
import { logAudit } from '~/server/services/audit';

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['platform_admin']);
  const body = await readBody(event);
  const { platformId, allowedOrganizationTypes, autoApproveTypes } = body;
  
  // Verify user has access to this platform
  if (user.platformId?.toString() !== platformId && user.role !== 'super_admin') {
    throw createError({ 
      statusCode: 403, 
      statusMessage: 'Access denied. You can only manage your own platform.' 
    });
  }
  
  const platform = await Platform.findById(platformId);
  
  if (!platform) {
    throw createError({ 
      statusCode: 404, 
      statusMessage: 'Platform not found' 
    });
  }
  
  // Validate that all type IDs exist
  if (allowedOrganizationTypes && allowedOrganizationTypes.length > 0) {
    const types = await OrganizationType.find({
      _id: { $in: allowedOrganizationTypes },
      status: 'active'
    });
    
    if (types.length !== allowedOrganizationTypes.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'One or more organization type IDs are invalid or inactive'
      });
    }
  }
  
  const oldSettings = {
    allowedOrganizationTypes: platform.allowedOrganizationTypes,
    autoApproveTypes: platform.autoApproveTypes
  };
  
  // Update platform
  platform.allowedOrganizationTypes = allowedOrganizationTypes;
  
  // Only super admin can change auto-approval setting
  if (autoApproveTypes !== undefined && user.role === 'super_admin') {
    platform.autoApproveTypes = autoApproveTypes;
  }
  
  await platform.save();
  
  // Log audit
  await logAudit({
    action: 'UPDATE_PLATFORM',
    entityType: 'Platform',
    entityId: platform._id.toString(),
    userId: user.id,
    platformId: platform._id.toString(),
    details: {
      field: 'allowedOrganizationTypes',
      oldValue: oldSettings,
      newValue: {
        allowedOrganizationTypes: platform.allowedOrganizationTypes,
        autoApproveTypes: platform.autoApproveTypes
      }
    },
    event
  });
  
  return {
    success: true,
    message: 'Platform organization types updated successfully',
    platform: {
      _id: platform._id,
      name: platform.name,
      allowedOrganizationTypes: platform.allowedOrganizationTypes,
      autoApproveTypes: platform.autoApproveTypes
    }
  };
});
