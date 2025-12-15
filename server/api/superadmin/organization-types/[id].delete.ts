import { H3Event } from 'h3';
import { requireRole } from '~/server/utils/auth';
import { connectDB } from '~/server/db/mongo';
import OrganizationType from '~/server/models/OrganizationType';
import Organization from '~/server/models/Organization';

export default defineEventHandler(async (event: H3Event) => {
  try {
    const typeId = event.context.params?.id;
    console.log('[ORG-TYPE-DELETE] Deleting organization type:', typeId);
    
    // Verify authentication and authorization
    await requireRole(event, ['super_admin']);

    if (!typeId) {
      throw createError({
        statusCode: 400,
        message: 'Organization type ID is required'
      });
    }

    // Connect to database
    await connectDB();

    // Find the organization type
    const organizationType = await OrganizationType.findById(typeId);
    
    if (!organizationType) {
      throw createError({
        statusCode: 404,
        message: 'Organization type not found'
      });
    }

    // Check if it's a platform-specific type
    if (organizationType.platformId) {
      throw createError({
        statusCode: 403,
        message: 'Cannot delete platform-specific organization types from this endpoint'
      });
    }

    // Check if any organizations are using this type
    const organizationsUsingType = await Organization.countDocuments({
      type: organizationType.code
    });

    if (organizationsUsingType > 0) {
      throw createError({
        statusCode: 400,
        message: `Cannot delete organization type. ${organizationsUsingType} organization(s) are currently using this type.`
      });
    }

    // Delete the organization type
    await OrganizationType.findByIdAndDelete(typeId);

    console.log('[ORG-TYPE-DELETE] Deleted organization type:', organizationType.code);

    return {
      success: true,
      message: 'Organization type deleted successfully'
    };
  } catch (error: any) {
    console.error('[ORG-TYPE-DELETE] Error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to delete organization type'
    });
  }
});
