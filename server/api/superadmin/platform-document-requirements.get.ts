import { defineEventHandler, createError, getQuery } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import DocumentType from '~/server/models/DocumentType';
import Organization from '~/server/models/Organization';

export default defineEventHandler(async (event) => {
  // Get current user
  const user = await getUserFromEvent(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  // Only superadmins can view platform document requirements
  if (user.role !== 'superadmin') {
    throw createError({ statusCode: 403, statusMessage: 'Access denied. Superadmin role required.' });
  }

  try {
    const query = getQuery(event);
    const { platformId } = query;

    // Get all platforms (organizations marked as platforms)
    const platforms = await Organization.find({ type: { $ne: null } }).select('_id name type');
    
    // Get all document types
    const allDocumentTypes = await DocumentType.find({ active: true }).sort({ layer: 1, order: 1 });

    const result: any = {
      platforms: platforms.map(platform => {
        const platformRequirements = {
          id: platform._id,
          name: platform.name,
          type: platform.type,
          documentTypes: {
            platform: [] as any[],
            organization: [] as any[],
            user: [] as any[]
          }
        };

        // Group document types by layer and check requirements for this platform
        allDocumentTypes.forEach(docType => {
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

          // Check if there's a custom requirement set for this platform
          const customReq = docType.layerSpecificRequirements?.find(
            (req: any) => req.forLayer === docType.layer && req.forLayerId === platform._id.toString()
          );

          if (customReq) {
            docInfo.customRequired = customReq.required;
            docInfo.setBy = customReq.setBy;
            docInfo.setAt = customReq.setAt;
          }

          // Final required status (custom overrides default)
          docInfo.finalRequired = customReq ? customReq.required : docType.required;

          if (docType.layer === 'platform') {
            platformRequirements.documentTypes.platform.push(docInfo);
          } else if (docType.layer === 'organization') {
            platformRequirements.documentTypes.organization.push(docInfo);
          } else if (docType.layer === 'user') {
            platformRequirements.documentTypes.user.push(docInfo);
          }
        });

        return platformRequirements;
      })
    };

    // If specific platform requested, return only that platform
    if (platformId) {
      const platform = result.platforms.find((p: any) => p.id.toString() === platformId);
      if (!platform) {
        throw createError({ statusCode: 404, statusMessage: 'Platform not found' });
      }
      return { success: true, platform };
    }

    return { success: true, platforms: result.platforms };

  } catch (error: any) {
    console.error('Error fetching platform document requirements:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch platform document requirements'
    });
  }
});