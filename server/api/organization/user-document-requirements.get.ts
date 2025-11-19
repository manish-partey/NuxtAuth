import { defineEventHandler, createError, getQuery } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import DocumentType from '~/server/models/DocumentType';
import User from '~/server/models/User';

export default defineEventHandler(async (event) => {
  // Get current user
  const user = await getUserFromEvent(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  // Only organization admins can view user document requirements
  if (user.role !== 'organization_admin') {
    throw createError({ statusCode: 403, statusMessage: 'Access denied. Organization admin role required.' });
  }

  try {
    const query = getQuery(event);
    const { userId } = query;

    // Get user details to check organization association
    const userDetails = await User.findById(user.id);
    if (!userDetails || !userDetails.organizationId) {
      throw createError({ statusCode: 403, statusMessage: 'Organization admin must be associated with an organization' });
    }

    // Get users in this organization
    const usersInOrg = await User.find({ 
      organizationId: userDetails.organizationId,
      role: 'user'
    }).select('_id name email');
    
    // Get all user document types
    const userDocumentTypes = await DocumentType.find({ 
      active: true, 
      layer: 'user' 
    }).sort({ order: 1 });

    const result: any = {
      users: usersInOrg.map(orgUser => {
        const userRequirements = {
          id: orgUser._id,
          name: orgUser.name,
          email: orgUser.email,
          documentTypes: [] as any[]
        };

        // Check requirements for this user
        userDocumentTypes.forEach(docType => {
          const docInfo: any = {
            id: docType._id,
            name: docType.name,
            key: docType.key,
            description: docType.description,
            defaultRequired: docType.required,
            customRequired: null,
            setBy: null,
            setAt: null
          };

          // Check if there's a custom requirement set for this specific user
          const userSpecificReq = docType.layerSpecificRequirements?.find(
            (req: any) => req.forLayer === 'user' && req.forLayerId === orgUser._id.toString()
          );

          // Check if there's a custom requirement set for all users in this org
          const orgWideReq = docType.layerSpecificRequirements?.find(
            (req: any) => req.forLayer === 'user' && req.forLayerId === 'all_users_in_org_' + userDetails.organizationId
          );

          const customReq = userSpecificReq || orgWideReq;
          
          if (customReq) {
            docInfo.customRequired = customReq.required;
            docInfo.setBy = customReq.setBy;
            docInfo.setAt = customReq.setAt;
            docInfo.scope = userSpecificReq ? 'specific' : 'organization-wide';
          }

          // Final required status (custom overrides default)
          docInfo.finalRequired = customReq ? customReq.required : docType.required;

          userRequirements.documentTypes.push(docInfo);
        });

        return userRequirements;
      }),
      organizationWideSettings: {
        documentTypes: userDocumentTypes.map(docType => {
          const docInfo: any = {
            id: docType._id,
            name: docType.name,
            key: docType.key,
            description: docType.description,
            defaultRequired: docType.required,
            organizationRequired: null,
            setBy: null,
            setAt: null
          };

          // Check if there's an organization-wide requirement
          const orgWideReq = docType.layerSpecificRequirements?.find(
            (req: any) => req.forLayer === 'user' && req.forLayerId === 'all_users_in_org_' + userDetails.organizationId
          );

          if (orgWideReq) {
            docInfo.organizationRequired = orgWideReq.required;
            docInfo.setBy = orgWideReq.setBy;
            docInfo.setAt = orgWideReq.setAt;
          }

          // Final required status for new users
          docInfo.finalRequired = orgWideReq ? orgWideReq.required : docType.required;

          return docInfo;
        })
      }
    };

    // If specific user requested, return only that user
    if (userId) {
      const userReq = result.users.find((u: any) => u.id.toString() === userId);
      if (!userReq) {
        throw createError({ statusCode: 404, statusMessage: 'User not found' });
      }
      return { success: true, user: userReq };
    }

    return { success: true, users: result.users, organizationWideSettings: result.organizationWideSettings };

  } catch (error: any) {
    console.error('Error fetching user document requirements:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch user document requirements'
    });
  }
});