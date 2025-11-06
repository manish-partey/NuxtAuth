import { getUserFromEvent } from '~/server/utils/auth';
import DocumentType from '~/server/models/DocumentType';

export default defineEventHandler(async (event) => {
  try {
    // Check authentication and authorization
    const user = await getUserFromEvent(event);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      });
    }

    // Only super_admin and platform_admin can manage document types
    if (!['super_admin', 'platform_admin'].includes(user.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Insufficient permissions to manage document types'
      });
    }

    const query = getQuery(event);
    const layer = query.layer as string;

    // Build filter
    const filter: any = {};
    if (layer && layer !== 'all') {
      filter.layer = layer;
    }

    // Get document types sorted by layer and order
    const documentTypes = await DocumentType.find(filter)
      .sort({ layer: 1, order: 1, name: 1 })
      .lean();

    console.log(`[ADMIN] Retrieved ${documentTypes.length} document types for admin: ${user.email}`);

    return {
      success: true,
      documentTypes: documentTypes || []
    };

  } catch (error: any) {
    console.error('[ADMIN] Error fetching document types:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch document types'
    });
  }
});