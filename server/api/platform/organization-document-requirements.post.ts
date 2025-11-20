import { defineEventHandler, createError, readBody } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import DocumentType from '~/server/models/DocumentType';
import User from '~/server/models/User';

export default defineEventHandler(async (event) => {
  // Get current user
  const user = await getUserFromEvent(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  // Only platform admins can manage organization document requirements
  if (user.role !== 'platform_admin') {
    throw createError({ statusCode: 403, statusMessage: 'Access denied. Platform admin role required.' });
  }

  try {
    const body = await readBody(event);
    const { organizationId, documentTypeId, required, action } = body;

    if (!organizationId || !documentTypeId || typeof required !== 'boolean' || !action) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'organizationId, documentTypeId, required (boolean), and action are required' 
      });
    }

    // Get user details to check platform association
    const userDetails = await User.findById(user.id);
    if (!userDetails || !userDetails.platformId) {
      throw createError({ statusCode: 403, statusMessage: 'Platform admin must be associated with a platform' });
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
      // Remove existing requirement for this organization if any
      documentType.layerSpecificRequirements = documentType.layerSpecificRequirements.filter(
        (req: any) => !(req.forLayer === 'organization' && req.forLayerId === organizationId)
      );

      // Add new requirement
      documentType.layerSpecificRequirements.push({
        forLayer: 'organization',
        forLayerId: organizationId,
        required,
        setBy: user.id,
        setAt: new Date()
      });
    } else if (action === 'remove') {
      // Remove requirement for this organization
      documentType.layerSpecificRequirements = documentType.layerSpecificRequirements.filter(
        (req: any) => !(req.forLayer === 'organization' && req.forLayerId === organizationId)
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
          (req: any) => req.forLayer === 'organization' && req.forLayerId === organizationId && req.required
        )
      }
    };

  } catch (error: any) {
    console.error('Error managing organization document requirements:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to manage document requirements'
    });
  }
});