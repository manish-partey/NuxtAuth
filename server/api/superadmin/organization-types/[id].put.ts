import { H3Event } from 'h3';
import { requireRole } from '~/server/utils/auth';
import { connectDB } from '~/server/db/mongo';
import OrganizationType from '~/server/models/OrganizationType';

export default defineEventHandler(async (event: H3Event) => {
  try {
    const typeId = event.context.params?.id;
    console.log('[ORG-TYPE-PUT] Updating organization type:', typeId);
    
    // Verify authentication and authorization
    await requireRole(event, ['super_admin']);

    if (!typeId) {
      throw createError({
        statusCode: 400,
        message: 'Organization type ID is required'
      });
    }

    // Get request body
    const body = await readBody(event);
    const { code, name, category, icon, description } = body;

    // Validate required fields
    if (!name || !category) {
      throw createError({
        statusCode: 400,
        message: 'Name and category are required'
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
        message: 'Cannot edit platform-specific organization types from this endpoint'
      });
    }

    // If code is being changed, check for duplicates
    if (code && code.toLowerCase() !== organizationType.code) {
      const existingType = await OrganizationType.findOne({
        code: code.toLowerCase(),
        platformId: { $exists: false },
        _id: { $ne: typeId }
      });

      if (existingType) {
        throw createError({
          statusCode: 400,
          message: `Organization type with code "${code}" already exists`
        });
      }
      
      organizationType.code = code.toLowerCase();
    }

    // Update fields
    organizationType.name = name;
    organizationType.category = category;
    if (icon) organizationType.icon = icon;
    if (description !== undefined) organizationType.description = description;

    await organizationType.save();

    console.log('[ORG-TYPE-PUT] Updated organization type:', organizationType.code);

    return {
      success: true,
      message: 'Organization type updated successfully',
      organizationType
    };
  } catch (error: any) {
    console.error('[ORG-TYPE-PUT] Error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to update organization type'
    });
  }
});
