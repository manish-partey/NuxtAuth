import { defineEventHandler, createError } from 'h3';
import { requireRole } from '~/server/utils/auth';
import DocumentType from '~/server/models/DocumentType';

export default defineEventHandler(async (event) => {
  try {
    // Check authentication and authorization - admin roles only
    const user = await requireRole(event, ['super_admin', 'platform_admin', 'organization_admin']);

    // Get all active document types
    const documentTypes = await DocumentType.find({ active: { $ne: false } })
      .sort({ layer: 1, order: 1, name: 1 })
      .lean();

    console.log(`[API] Fetched ${documentTypes.length} document types for user role: ${user.role}`);

    return {
      success: true,
      documentTypes: documentTypes.map(doc => ({
        _id: doc._id,
        key: doc.key,
        name: doc.name,
        layer: doc.layer,
        required: doc.required,
        description: doc.description,
        active: doc.active !== false,
        maxSize: doc.maxSize,
        allowedMimeTypes: doc.allowedMimeTypes,
        order: doc.order,
        layerSpecificRequirements: doc.layerSpecificRequirements || []
      }))
    };

  } catch (error: any) {
    console.error('[API] Error fetching document types:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch document types'
    });
  }
});