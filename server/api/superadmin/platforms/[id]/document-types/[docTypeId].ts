import { defineEventHandler, createError, readBody, getRouterParam } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import DocumentType from '~/server/models/DocumentType';

export default defineEventHandler(async (event) => {
  try {
    // Check authentication and authorization
    const user = await getUserFromEvent(event);
    if (!user || user.role !== 'super_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only super admin can manage document types'
      });
    }

    const platformId = getRouterParam(event, 'id');
    const docTypeId = getRouterParam(event, 'docTypeId');

    if (!platformId || !docTypeId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Platform ID and Document Type ID are required'
      });
    }

    if (event.node.req.method === 'PATCH') {
      // Update document type
      const body = await readBody(event);
      const updates = body;

      const documentType = await DocumentType.findOneAndUpdate(
        { 
          _id: docTypeId, 
          $or: [
            { platformId: platformId },
            { platformId: { $exists: false } }
          ]
        },
        { 
          ...updates,
          updatedAt: new Date(),
          updatedBy: user.id
        },
        { new: true }
      );

      if (!documentType) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Document type not found'
        });
      }

      return {
        success: true,
        message: 'Document type updated successfully',
        documentType
      };
    }

    if (event.node.req.method === 'DELETE') {
      // Delete document type (soft delete)
      const documentType = await DocumentType.findOneAndUpdate(
        { 
          _id: docTypeId, 
          $or: [
            { platformId: platformId },
            { platformId: { $exists: false } }
          ]
        },
        { 
          active: false,
          deletedAt: new Date(),
          deletedBy: user.id
        },
        { new: true }
      );

      if (!documentType) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Document type not found'
        });
      }

      return {
        success: true,
        message: 'Document type deleted successfully'
      };
    }

    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    });

  } catch (error: any) {
    console.error('[SUPERADMIN] Error managing document type:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to manage document type'
    });
  }
});