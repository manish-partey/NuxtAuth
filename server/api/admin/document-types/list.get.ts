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

    // Check if user has admin role
    if (!['super_admin', 'platform_admin', 'organization_admin'].includes(user.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Insufficient permissions to view document types'
      });
    }

    const query = getQuery(event);
    const layer = query.layer as string;

    // Build filter based on user role and requested layer
    const filter: any = {};
    
    // Role-based layer access control
    let allowedLayers: string[] = [];
    
    if (user.role === 'super_admin') {
      allowedLayers = ['platform', 'organization', 'user'];
    } else if (user.role === 'platform_admin') {
      allowedLayers = ['organization', 'user'];
    } else if (user.role === 'organization_admin') {
      allowedLayers = ['user'];
    }

    // Apply layer filter
    if (layer && layer !== 'all') {
      if (!allowedLayers.includes(layer)) {
        throw createError({
          statusCode: 403,
          statusMessage: `You don't have permission to manage ${layer} layer documents`
        });
      }
      filter.layer = layer;
    } else {
      // Only show layers the user can manage
      filter.layer = { $in: allowedLayers };
    }

    // Get document types sorted by layer and order
    const documentTypes = await DocumentType.find(filter)
      .sort({ layer: 1, order: 1, name: 1 })
      .lean();

    console.log(`[ADMIN] Retrieved ${documentTypes.length} document types for ${user.role}: ${user.email}`);

    return {
      success: true,
      documentTypes: documentTypes || [],
      allowedLayers: allowedLayers
    };

  } catch (error: any) {
    console.error('[ADMIN] Error fetching document types:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch document types'
    });
  }
});