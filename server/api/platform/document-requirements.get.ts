import { defineEventHandler, createError } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import DocumentType from '~/server/models/DocumentType';
import Document from '~/server/models/document';
import Organization from '~/server/models/Organization';

export default defineEventHandler(async (event) => {
  // Get current user
  const user = await getUserFromEvent(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  // Only platform admins can access this
  if (user.role !== 'platform_admin') {
    throw createError({ statusCode: 403, statusMessage: 'Access denied. Platform admin only.' });
  }

  try {
    // Get current platform info (stored in Organization collection)
    const platform = await Organization.findById(user.platformId);
    if (!platform) {
      throw createError({ statusCode: 404, statusMessage: 'Platform not found' });
    }

    // Get all document types
    const allDocumentTypes = await DocumentType.find({ active: true }).sort({ layer: 1, order: 1 });

    // Get existing documents for this platform
    const existingDocuments = await Document.find({
      layer: 'platform',
      layerId: user.platformId
    });

    // Categorize document types by layer and requirement
    const requirements = {
      platform: {
        name: platform.name,
        id: platform._id,
        required: [] as any[],
        optional: [] as any[],
        uploaded: [] as any[]
      },
      organization: {
        required: [] as any[],
        optional: [] as any[]
      },
      user: {
        required: [] as any[],
        optional: [] as any[]
      }
    };

    // Process document types
    for (const docType of allDocumentTypes) {
      const docInfo: any = {
        id: docType._id,
        name: docType.name,
        key: docType.key,
        description: docType.description,
        maxSize: docType.maxSize,
        allowedMimeTypes: docType.allowedMimeTypes,
        rolesAllowed: docType.rolesAllowed,
        status: 'pending'
      };

      // Check if document is already uploaded
      const existingDoc = existingDocuments.find(doc => 
        doc.name === docType.key || doc.name === docType.name
      );
      
      if (existingDoc) {
        docInfo.status = existingDoc.status;
        docInfo.uploadedAt = existingDoc.uploadedAt;
        docInfo.fileUrl = existingDoc.fileUrl;
        requirements.platform.uploaded.push(docInfo);
      }

      // Categorize by layer and requirement
      if (docType.layer === 'platform') {
        if (docType.required) {
          requirements.platform.required.push(docInfo);
        } else {
          requirements.platform.optional.push(docInfo);
        }
      } else if (docType.layer === 'organization') {
        if (docType.required) {
          requirements.organization.required.push(docInfo);
        } else {
          requirements.organization.optional.push(docInfo);
        }
      } else if (docType.layer === 'user') {
        if (docType.required) {
          requirements.user.required.push(docInfo);
        } else {
          requirements.user.optional.push(docInfo);
        }
      }
    }

    // Calculate completion statistics
    const stats = {
      platform: {
        total: requirements.platform.required.length + requirements.platform.optional.length,
        completed: requirements.platform.uploaded.length,
        required: requirements.platform.required.length,
        requiredCompleted: requirements.platform.required.filter(req => 
          requirements.platform.uploaded.some(up => up.key === req.key)
        ).length
      },
      organization: {
        total: requirements.organization.required.length + requirements.organization.optional.length,
        required: requirements.organization.required.length,
        optional: requirements.organization.optional.length
      },
      user: {
        total: requirements.user.required.length + requirements.user.optional.length,
        required: requirements.user.required.length,
        optional: requirements.user.optional.length
      }
    };

    return {
      success: true,
      platform: requirements.platform,
      organizationRequirements: requirements.organization,
      userRequirements: requirements.user,
      stats
    };

  } catch (error: any) {
    console.error('Error fetching platform document requirements:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch document requirements'
    });
  }
});