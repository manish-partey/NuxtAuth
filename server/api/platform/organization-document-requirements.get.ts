import { defineEventHandler, createError, getQuery } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import DocumentType from '~/server/models/DocumentType';
import Organization from '~/server/models/Organization';
import User from '~/server/models/User';

export default defineEventHandler(async (event) => {
  // Get current user
  const user = await getUserFromEvent(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  // Only platform admins can view organization document requirements
  if (user.role !== 'platform_admin') {
    throw createError({ statusCode: 403, statusMessage: 'Access denied. Platform admin role required.' });
  }

  try {
    const query = getQuery(event);
    const { organizationId } = query;

    // Get user details to check platform association
    const userDetails = await User.findById(user.id);
    if (!userDetails || !userDetails.platformId) {
      throw createError({ statusCode: 403, statusMessage: 'Platform admin must be associated with a platform' });
    }

    // Get organizations under this platform
    const organizations = await Organization.find({ 
      platformId: userDetails.platformId,
      type: null // Regular organizations, not platforms
    }).select('_id name description');
    
    // Get all document types
    const allDocumentTypes = await DocumentType.find({ active: true }).sort({ layer: 1, order: 1 });

    const result: any = {
      organizations: organizations.map(org => {
        const orgRequirements = {
          id: org._id,
          name: org.name,
          description: org.description,
          documentTypes: {
            organization: [] as any[],
            user: [] as any[]
          }
        };

        // Group document types by layer and check requirements for this organization
        allDocumentTypes.forEach(docType => {
          // Only show organization and user layer documents
          if (!['organization', 'user'].includes(docType.layer)) return;

          const docInfo: any = {
            id: docType._id,
            name: docType.name,
            key: docType.key,
            description: docType.description,
            layer: docType.layer,
            defaultRequired: docType.required,
            customRequired: null,
            setBy: null,
            setAt: null
          };

          // Check if there's a custom requirement set for this organization
          const customReq = docType.layerSpecificRequirements?.find(
            (req: any) => req.forLayer === docType.layer && req.forLayerId === org._id.toString()
          );

          if (customReq) {
            docInfo.customRequired = customReq.required;
            docInfo.setBy = customReq.setBy;
            docInfo.setAt = customReq.setAt;
          }

          // Final required status (custom overrides default)
          docInfo.finalRequired = customReq ? customReq.required : docType.required;

          if (docType.layer === 'organization') {
            orgRequirements.documentTypes.organization.push(docInfo);
          } else if (docType.layer === 'user') {
            orgRequirements.documentTypes.user.push(docInfo);
          }
        });

        return orgRequirements;
      })
    };

    // If specific organization requested, return only that organization
    if (organizationId) {
      const organization = result.organizations.find((o: any) => o.id.toString() === organizationId);
      if (!organization) {
        throw createError({ statusCode: 404, statusMessage: 'Organization not found' });
      }
      return { success: true, organization };
    }

    return { success: true, organizations: result.organizations };

  } catch (error: any) {
    console.error('Error fetching organization document requirements:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch organization document requirements'
    });
  }
});