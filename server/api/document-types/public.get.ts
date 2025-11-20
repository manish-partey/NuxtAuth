import { defineEventHandler, getQuery, createError } from 'h3';
import DocumentType from '~/server/models/DocumentType';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const layer = query.layer as string;

    if (!layer) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Layer parameter is required'
      });
    }

    // Validate layer
    const validLayers = ['platform', 'organization', 'user'];
    if (!validLayers.includes(layer)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid layer. Must be one of: platform, organization, user'
      });
    }

    // Get active document types for the specified layer
    const documentTypes = await DocumentType.find({
      layer: layer,
      active: true
    }).sort({ order: 1, name: 1 }).lean();

    // Transform to frontend-compatible format
    const transformedDocumentTypes = documentTypes.map((doc: any) => ({
      _id: (doc._id as string).toString(),
      name: doc.name,
      description: doc.description || '',
      required: doc.required,
      key: doc.key,
      layer: doc.layer,
      order: doc.order || 0,
      maxSize: doc.maxSize,
      allowedMimeTypes: doc.allowedMimeTypes || []
    }));

    console.log(`[PUBLIC] Retrieved ${transformedDocumentTypes.length} document types for layer: ${layer}`);

    return {
      success: true,
      documentTypes: transformedDocumentTypes
    };

  } catch (error: any) {
    console.error('[PUBLIC] Error fetching document types:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch document types'
    });
  }
});