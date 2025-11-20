import { defineEventHandler, createError } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import DocumentType from '~/server/models/DocumentType';
import Document from '~/server/models/Document';
import Organization from '~/server/models/Organization';

export default defineEventHandler(async (event) => {
  // Get current user
  const user = await getUserFromEvent(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  // Only organization admins can access this
  if (user.role !== 'organization_admin') {
    throw createError({ statusCode: 403, statusMessage: 'Access denied. Organization admin only.' });
  }

  try {
    // Get current organization info
    const organization = await Organization.findById(user.organizationId);
    if (!organization) {
      throw createError({ statusCode: 404, statusMessage: 'Organization not found' });
    }

    // Get all document types
    const allDocumentTypes = await DocumentType.find({ active: true }).sort({ layer: 1, order: 1 });

    // Get existing documents for this organization
    const existingDocuments = await Document.find({
      layer: 'organization',
      layerId: user.organizationId
    });

    // Categorize document types by layer and requirement
    const requirements = {
      organization: {
        name: organization.name,
        id: organization._id,
        required: [] as any[],
        optional: [] as any[],
        uploaded: [] as any[]
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

      // Check if document is already uploaded for organization layer
      if (docType.layer === 'organization') {
        const existingDoc = existingDocuments.find(doc => 
          doc.name === docType.key || doc.name === docType.name
        );
        
        if (existingDoc) {
          docInfo.status = existingDoc.status;
          docInfo.uploadedAt = existingDoc.uploadedAt;
          docInfo.fileUrl = existingDoc.fileUrl;
          requirements.organization.uploaded.push(docInfo);
        }

        // Categorize by requirement
        if (docType.required) {
          requirements.organization.required.push(docInfo);
        } else {
          requirements.organization.optional.push(docInfo);
        }
      } else if (docType.layer === 'user') {
        // User documents - just show what's required/optional
        if (docType.required) {
          requirements.user.required.push(docInfo);
        } else {
          requirements.user.optional.push(docInfo);
        }
      }
    }

    // Calculate completion statistics
    const stats = {
      organization: {
        total: requirements.organization.required.length + requirements.organization.optional.length,
        completed: requirements.organization.uploaded.length,
        required: requirements.organization.required.length,
        requiredCompleted: requirements.organization.required.filter(req => 
          requirements.organization.uploaded.some(up => up.key === req.key)
        ).length
      },
      user: {
        total: requirements.user.required.length + requirements.user.optional.length,
        required: requirements.user.required.length,
        optional: requirements.user.optional.length
      }
    };

    return {
      success: true,
      organization: requirements.organization,
      userRequirements: requirements.user,
      stats
    };

  } catch (error: any) {
    console.error('Error fetching organization document requirements:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch document requirements'
    });
  }
});