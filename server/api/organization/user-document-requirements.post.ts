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

  // Only organization admins can manage user document requirements
  if (user.role !== 'organization_admin') {
    throw createError({ statusCode: 403, statusMessage: 'Access denied. Organization admin role required.' });
  }

  try {
    const body = await readBody(event);
    const { userId, documentTypeId, required, action } = body;

    if (!documentTypeId || typeof required !== 'boolean' || !action) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'documentTypeId, required (boolean), and action are required' 
      });
    }

    // Get user details to check organization association
    const userDetails = await User.findById(user.id);
    if (!userDetails || !userDetails.organizationId) {
      throw createError({ statusCode: 403, statusMessage: 'Organization admin must be associated with an organization' });
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

    const targetId = userId || 'all_users_in_org_' + userDetails.organizationId;

    if (action === 'set') {
      // Remove existing requirement if any
      documentType.layerSpecificRequirements = documentType.layerSpecificRequirements.filter(
        (req: any) => !(req.forLayer === 'user' && req.forLayerId === targetId)
      );

      // Add new requirement
      documentType.layerSpecificRequirements.push({
        forLayer: 'user',
        forLayerId: targetId,
        required,
        setBy: user.id,
        setAt: new Date()
      });
    } else if (action === 'remove') {
      // Remove requirement
      documentType.layerSpecificRequirements = documentType.layerSpecificRequirements.filter(
        (req: any) => !(req.forLayer === 'user' && req.forLayerId === targetId)
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
          (req: any) => req.forLayer === 'user' && req.forLayerId === targetId && req.required
        )
      }
    };

  } catch (error: any) {
    console.error('Error managing user document requirements:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to manage document requirements'
    });
  }
});