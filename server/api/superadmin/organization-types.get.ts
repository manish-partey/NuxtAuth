import { H3Event } from 'h3';
import { requireRole } from '~/server/utils/auth';
import { connectDB } from '~/server/db/mongo';
import OrganizationType from '~/server/models/OrganizationType';

export default defineEventHandler(async (event: H3Event) => {
  try {
    console.log('[ORG-TYPES-GET] Fetching organization types');
    
    // Verify authentication and authorization
    await requireRole(event, ['super_admin']);

    // Connect to database
    await connectDB();

    // Fetch all global organization types (not platform-specific)
    const organizationTypes = await OrganizationType.find({
      platformId: { $exists: false }
    }).sort({ category: 1, name: 1 });

    console.log('[ORG-TYPES-GET] Found', organizationTypes.length, 'organization types');

    return {
      success: true,
      types: organizationTypes
    };
  } catch (error: any) {
    console.error('[ORG-TYPES-GET] Error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch organization types'
    });
  }
});
