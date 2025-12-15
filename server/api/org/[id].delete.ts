// server/api/org/[id].delete.ts
import { defineEventHandler, createError } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import { connectToDatabase } from '~/server/utils/db';
import Organization from '~/server/models/Organization';
import User from '~/server/models/User';
import AuditLog from '~/server/models/AuditLog';

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();

    // Get authenticated user
    const user = await getUserFromEvent(event);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      });
    }

    // Only super_admin and platform_admin can delete organizations
    if (user.role !== 'super_admin' && user.role !== 'platform_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only super administrators and platform administrators can delete organizations'
      });
    }

    // Get organization ID from route params
    const orgId = event.context.params?.id;
    if (!orgId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Organization ID is required'
      });
    }

    // Find the organization
    const organization = await Organization.findById(orgId);
    if (!organization) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Organization not found'
      });
    }

    // Platform admins can only delete organizations under their platform
    if (user.role === 'platform_admin') {
      if (!user.platformId || organization.platformId?.toString() !== user.platformId.toString()) {
        throw createError({
          statusCode: 403,
          statusMessage: 'You can only delete organizations under your platform'
        });
      }
    }

    // Check if organization has users
    const userCount = await User.countDocuments({ organizationId: orgId });
    if (userCount > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot delete organization. It has ${userCount} user(s). Please remove all users first.`
      });
    }

    // Store organization details for audit log
    const orgDetails = {
      name: organization.name,
      platformId: organization.platformId,
      status: organization.status,
      type: organization.type
    };

    // Delete the organization
    await Organization.findByIdAndDelete(orgId);

    // Log the deletion
    try {
      const ipAddress = (event.node.req.headers['x-forwarded-for'] as string) || 
                        event.node.req.socket?.remoteAddress || 'unknown';
      const userAgent = (event.node.req.headers['user-agent'] as string) || 'unknown';

      await AuditLog.create({
        action: 'organization_deleted',
        targetType: 'Organization',
        targetId: orgId,
        userId: user.id,
        platformId: organization.platformId,
        details: orgDetails,
        ipAddress,
        userAgent
      });
    } catch (auditError) {
      console.error('[DELETE ORGANIZATION] Failed to log audit:', auditError);
      // Don't fail the deletion if audit logging fails
    }

    return {
      success: true,
      message: 'Organization deleted successfully'
    };

  } catch (error: any) {
    console.error('[DELETE ORGANIZATION] Error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to delete organization'
    });
  }
});
