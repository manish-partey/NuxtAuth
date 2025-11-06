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

    // Only super_admin and platform_admin can update document types
    if (!['super_admin', 'platform_admin'].includes(user.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Insufficient permissions to update document types'
      });
    }

    const documentTypeId = getRouterParam(event, 'id');
    const body = await readBody(event);

    if (!documentTypeId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Document type ID is required'
      });
    }

    // Find the document type
    const documentType = await DocumentType.findById(documentTypeId);
    if (!documentType) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Document type not found'
      });
    }

    // Update fields
    const allowedFields = [
      'name', 'required', 'description', 'maxSize', 'allowedMimeTypes',
      'rolesAllowed', 'active', 'order'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        documentType[field] = body[field];
      }
    });

    // Validate layer if provided (but don't allow changing it)
    if (body.layer && body.layer !== documentType.layer) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot change layer of existing document type'
      });
    }

    // Validate key if provided (but don't allow changing it)
    if (body.key && body.key !== documentType.key) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot change key of existing document type'
      });
    }

    await documentType.save();

    console.log(`[ADMIN] Document type updated: ${documentType.name} (${documentType.key}) by ${user.email}`);

    return {
      success: true,
      documentType,
      message: 'Document type updated successfully'
    };

  } catch (error: any) {
    console.error('[ADMIN] Error updating document type:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to update document type'
    });
  }
});