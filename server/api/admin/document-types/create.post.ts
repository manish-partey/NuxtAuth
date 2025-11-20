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

    // Hierarchical permission check
    if (layer === 'platform' && user.role !== 'super_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only super_admin can create platform-level document requirements'
      });
    }
    
    if (layer === 'organization' && !['super_admin', 'platform_admin'].includes(user.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only super_admin or platform_admin can create organization-level document requirements'
      });
    }
    
    if (layer === 'user' && !['super_admin', 'platform_admin', 'organization_admin'].includes(user.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only admin roles can create user-level document requirements'
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

    console.log(`[ADMIN] Document type created: ${name} (${key}) for layer ${layer} by ${user.role}: ${user.email}`);

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