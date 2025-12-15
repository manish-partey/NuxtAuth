import { H3Event } from 'h3';
import { requireRole } from '~/server/utils/auth';
import { connectDB } from '~/server/db/mongo';
import OrganizationType from '~/server/models/OrganizationType';

export default defineEventHandler(async (event: H3Event) => {
  try {
    console.log('[ORG-TYPES-POST] Creating/updating organization type');
    
    // Verify authentication and authorization
    await requireRole(event, ['super_admin']);

    // Get request body
    const body = await readBody(event);
    const { code, name, category, icon, description } = body;

    // Validate required fields
    if (!code || !name || !category) {
      throw createError({
        statusCode: 400,
        message: 'Code, name, and category are required'
      });
    }

    // Connect to database
    await connectDB();

    // Check if code already exists (for global types only)
    const existingType = await OrganizationType.findOne({
      code: code.toLowerCase(),
      platformId: { $exists: false }
    });

    if (existingType) {
      throw createError({
        statusCode: 400,
        message: `Organization type with code "${code}" already exists`
      });
    }

    // Create new organization type
    const organizationType = await OrganizationType.create({
      code: code.toLowerCase(),
      name,
      category,
      icon: icon || '🏢',
      description: description || '',
      // No platformId = global type
    });

    console.log('[ORG-TYPES-POST] Created organization type:', organizationType.code);

    return {
      success: true,
      message: 'Organization type created successfully',
      organizationType
    };
  } catch (error: any) {
    console.error('[ORG-TYPES-POST] Error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to create organization type'
    });
  }
});
