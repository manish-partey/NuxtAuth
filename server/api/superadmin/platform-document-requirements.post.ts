import { defineEventHandler, createError, readBody } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import DocumentType from '~/server/models/DocumentType';

export default defineEventHandler(async (event) => {
  // Get current user
  const user = await getUserFromEvent(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  // Only superadmins can manage platform document requirements
  if (user.role !== 'superadmin') {
    throw createError({ statusCode: 403, statusMessage: 'Access denied. Superadmin role required.' });
  }

  try {
    const body = await readBody(event);
    const { platformId, documentTypeId, required, action } = body;

    if (!platformId || !documentTypeId || typeof required !== 'boolean' || !action) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'platformId, documentTypeId, required (boolean), and action are required' 
      });
    }

    // Find the document type
    const documentType = await DocumentType.findById(documentTypeId);
    if (!documentType) {
      throw createError({ statusCode: 404, statusMessage: 'Document type not found' });
    }

    // Initialize layerSpecificRequirements if it doesn't exist
    if (!documentType.layerSpecificRequirements) {
      documentType.layerSpecificRequirements = [];
    }

    if (action === 'set') {
      // Remove existing requirement for this platform if any
      documentType.layerSpecificRequirements = documentType.layerSpecificRequirements.filter(
        (req: any) => !(req.forLayer === 'platform' && req.forLayerId === platformId)
      );

      // Add new requirement
      documentType.layerSpecificRequirements.push({
        forLayer: 'platform',
        forLayerId: platformId,
        required,
        setBy: user.id,
        setAt: new Date()
      });
    } else if (action === 'remove') {
      // Remove requirement for this platform
      documentType.layerSpecificRequirements = documentType.layerSpecificRequirements.filter(
        (req: any) => !(req.forLayer === 'platform' && req.forLayerId === platformId)
      );
    } else {
      throw createError({ statusCode: 400, statusMessage: 'Invalid action. Use "set" or "remove"' });
    }

    await documentType.save();

    return {
      success: true,
      message: `Document requirement ${action === 'set' ? 'updated' : 'removed'} successfully`,
      documentType: {
        id: documentType._id,
        name: documentType.name,
        key: documentType.key,
        layer: documentType.layer,
        required: documentType.layerSpecificRequirements.some(
          (req: any) => req.forLayer === 'platform' && req.forLayerId === platformId && req.required
        )
      }
    };

  } catch (error: any) {
    console.error('Error managing platform document requirements:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to manage document requirements'
    });
  }
});