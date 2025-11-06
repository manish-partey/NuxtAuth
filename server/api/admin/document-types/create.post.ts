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

    // Only super_admin and platform_admin can create document types
    if (!['super_admin', 'platform_admin'].includes(user.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Insufficient permissions to create document types'
      });
    }

    const body = await readBody(event);
    const {
      name,
      key,
      layer,
      required,
      description,
      maxSize,
      allowedMimeTypes,
      rolesAllowed,
      active,
      order
    } = body;

    // Validate required fields
    if (!name || !key || !layer) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name, key, and layer are required'
      });
    }

    // Validate layer
    if (!['platform', 'organization', 'user'].includes(layer)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Layer must be platform, organization, or user'
      });
    }

    // Check if key already exists
    const existingDocType = await DocumentType.findOne({ key });
    if (existingDocType) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Document type with this key already exists'
      });
    }

    // Create new document type
    const newDocumentType = new DocumentType({
      name,
      key,
      layer,
      required: required ?? false,
      description,
      maxSize: maxSize || 10 * 1024 * 1024, // 10MB default
      allowedMimeTypes: allowedMimeTypes || [],
      rolesAllowed: rolesAllowed || [],
      active: active ?? true,
      order: order || 0
    });

    await newDocumentType.save();

    console.log(`[ADMIN] Document type created: ${name} (${key}) by ${user.email}`);

    return {
      success: true,
      documentType: newDocumentType,
      message: 'Document type created successfully'
    };

  } catch (error: any) {
    console.error('[ADMIN] Error creating document type:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to create document type'
    });
  }
});