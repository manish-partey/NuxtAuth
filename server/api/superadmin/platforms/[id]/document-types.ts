import { defineEventHandler, createError, readBody, getRouterParam } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import DocumentType from '~/server/models/DocumentType';
import Organization from '~/server/models/Organization';

export default defineEventHandler(async (event) => {
  try {
    // Check authentication and authorization
    const user = await getUserFromEvent(event);
    if (!user || user.role !== 'super_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only super admin can manage platform document types'
      });
    }

    const platformId = getRouterParam(event, 'id');
    if (!platformId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Platform ID is required'
      });
    }

    // Verify platform exists
    const platform = await Organization.findOne({ 
      _id: platformId, 
      type: 'platform' 
    });
    
    if (!platform) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Platform not found'
      });
    }

    if (event.node.req.method === 'GET') {
      // Get document types for this platform
      const documentTypes = await DocumentType.find({
        $or: [
          { platformId: platformId },
          { layer: 'platform', platformId: { $exists: false } } // Global platform documents
        ],
        active: { $ne: false }
      }).sort({ layer: 1, required: -1, name: 1 }).lean();

      return {
        success: true,
        documentTypes
      };
    }

    if (event.node.req.method === 'POST') {
      // Create new document type for platform
      const body = await readBody(event);
      const { 
        name, 
        key, 
        description, 
        layer, 
        required, 
        maxSize, 
        allowedMimeTypes 
      } = body;

      if (!name || !key || !layer) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Name, key, and layer are required'
        });
      }

      // Check if document type with this key already exists for this platform
      const existingDoc = await DocumentType.findOne({
        key,
        $or: [
          { platformId: platformId },
          { platformId: { $exists: false } }
        ]
      });

      if (existingDoc) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Document type with this key already exists'
        });
      }

      // Create document type
      const documentType = new DocumentType({
        name,
        key,
        description,
        layer,
        required: required || false,
        maxSize: maxSize || 5 * 1024 * 1024,
        allowedMimeTypes: allowedMimeTypes || ['application/pdf', 'image/jpeg', 'image/png'],
        active: true,
        platformId: platformId,
        createdBy: user.id,
        createdAt: new Date()
      });

      await documentType.save();

      console.log(`[SUPERADMIN] Document type "${name}" created for platform ${platformId}`);

      return {
        success: true,
        message: 'Document type created successfully',
        documentType: documentType.toObject()
      };
    }

    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    });

  } catch (error: any) {
    console.error('[SUPERADMIN] Error managing platform document types:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to manage platform document types'
    });
  }
});