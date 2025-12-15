// server/api/org/[id].get.ts
import { defineEventHandler, createError, getRouterParam } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import Organization from '~/server/models/Organization';
import Platform from '~/server/models/Platform';

export default defineEventHandler(async (event) => {
  try {
    // Check authentication
    const user = await getUserFromEvent(event);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      });
    }

    // Get organization ID from route parameter
    const orgId = getRouterParam(event, 'id');
    
    if (!orgId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Organization ID is required'
      });
    }

    // Fetch organization
    const organization = await Organization.findById(orgId).lean() as any;

    if (!organization) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Organization not found'
      });
    }

    // Authorization check based on role
    if (user.role === 'organization_admin' && user.organizationId !== orgId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied'
      });
    }

    if (user.role === 'platform_admin' && user.platformId !== organization.platformId?.toString()) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied'
      });
    }

    // Get platform name if platformId exists
    let platformName = 'N/A';
    if (organization.platformId) {
      const platform = await Platform.findById(organization.platformId).lean() as any;
      platformName = platform?.name || 'Unknown';
    }

    // Get approval/rejection details if they exist
    const approvalDetails = organization.approvedBy ? {
      approvedBy: organization.approvedBy,
      approvedAt: organization.approvedAt,
      approvalNotes: organization.approvalNotes
    } : null;

    const rejectionDetails = organization.rejectedBy ? {
      rejectedBy: organization.rejectedBy,
      rejectedAt: organization.rejectedAt,
      rejectionReason: organization.rejectionReason
    } : null;

    return {
      success: true,
      organization: {
        ...organization,
        platformName,
        approvalDetails,
        rejectionDetails
      }
    };

  } catch (error: any) {
    console.error('Error fetching organization:', error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch organization details'
    });
  }
});
