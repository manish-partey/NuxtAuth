import { getUserFromEvent } from '~/server/utils/auth';
import DocumentType from '~/server/models/DocumentType';
import Document from '~/server/models/document';

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

    const documentTypeId = getRouterParam(event, 'id');

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

    // Hierarchical permission check based on document type layer
    if (documentType.layer === 'platform' && user.role !== 'super_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only super_admin can delete platform-level document requirements'
      });
    }
    
    if (documentType.layer === 'organization' && !['super_admin', 'platform_admin'].includes(user.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only super_admin or platform_admin can delete organization-level document requirements'
      });
    }
    
    if (documentType.layer === 'user' && !['super_admin', 'platform_admin', 'organization_admin'].includes(user.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only admin roles can delete user-level document requirements'
      });
    }

    // Check if there are any documents using this type
    const documentsCount = await Document.countDocuments({ 
      documentType: documentType.key 
    });

    if (documentsCount > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot delete document type. ${documentsCount} documents are using this type. Please delete or reassign these documents first.`
      });
    }

    // Delete the document type
    await DocumentType.findByIdAndDelete(documentTypeId);

    console.log(`[ADMIN] Document type deleted: ${documentType.name} (${documentType.key}) for layer ${documentType.layer} by ${user.role}: ${user.email}`);

    return {
      success: true,
      message: 'Document type deleted successfully'
    };

  } catch (error: any) {
    console.error('[ADMIN] Error deleting document type:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to delete document type'
    });
  }
});