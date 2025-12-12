import { defineEventHandler, createError, readBody } from 'h3';
import { requirePlatformAccess } from '~/server/utils/auth';
import Platform from '~/server/models/Platform';
import Organization from '~/server/models/Organization';
import DocumentType from '~/server/models/DocumentType';
import { connectToDatabase } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    // Connect to database
    await connectToDatabase();

    // Check authentication and authorization - only super_admin and platform_admin
    const user = await requirePlatformAccess(event);

    if (event.node.req.method === 'GET') {
      // Get platforms - super admin sees all, platform admin sees their own and created ones
      let query: any = {};
      
      // If platform admin, show platforms they are admin of OR created
      if (user.role === 'platform_admin') {
        query = {
          $or: [
            { _id: user.platformId }, // Platform they are admin of
            { createdBy: user.id }    // Platforms they created
          ]
        };
      }
      
      console.log('[PLATFORM ADMIN] Fetching platforms with query:', query);
      
      const platforms = await Platform.find(query)
        .sort({ createdAt: -1 })
        .lean();
        
      console.log('[PLATFORM ADMIN] Found platforms count:', platforms.length);

      // Add organization and user counts for each platform
      const platformsWithCounts = await Promise.all(
        platforms.map(async (platform) => {
          const organizationCount = await Organization.countDocuments({ 
            platformId: platform._id
          });
          
          return {
            ...platform,
            organizationCount,
            userCount: 0 // TODO: implement user count if needed
          };
        })
      );

      return {
        success: true,
        data: platformsWithCounts
      };
    }

    if (event.node.req.method === 'POST') {
      // Only super_admin can create platforms
      if (user.role !== 'super_admin') {
        throw createError({
          statusCode: 403,
          statusMessage: 'Only super admins can create platforms'
        });
      }

      // Create new platform
      const body = await readBody(event);
      const { name, description, type, slug, documentRequirements = [] } = body;

      if (!name || !type) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Platform name and type are required'
        });
      }

      // Generate slug if not provided
      const platformSlug = slug || name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      // Check if platform name or slug already exists
      const existingPlatform = await Platform.findOne({ 
        $or: [
          { name: name },
          { slug: platformSlug }
        ]
      });

      if (existingPlatform) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Platform with this name or slug already exists'
        });
      }

      // Create platform
      const platform = new Platform({
        name: name.trim(),
        type: type,
        slug: platformSlug,
        domain: `${platformSlug}.platform.easemycargo.com`,
        status: 'active', // Platforms are auto-approved and active
        createdBy: user.id,
        description: description?.trim() || '',
      });

      await platform.save();

      // Process document requirements if provided
      if (documentRequirements && documentRequirements.length > 0) {
        for (const requirement of documentRequirements) {
          try {
            // Verify document type exists
            const documentType = await DocumentType.findById(requirement.documentTypeId);
            if (!documentType) {
              console.warn(`Document type ${requirement.documentTypeId} not found, skipping`);
              continue;
            }

            // Create or update document requirement for this platform
            await DocumentType.findByIdAndUpdate(
              requirement.documentTypeId,
              {
                $addToSet: {
                  layerSpecificRequirements: {
                    layer: 'platform',
                    entityId: platform._id,
                    required: requirement.required || false
                  }
                }
              },
              { new: true }
            );

            console.log(`Added platform requirement for document type: ${documentType.name}`);
          } catch (docError) {
            console.error(`Error processing document requirement:`, docError);
          }
        }
      }

      console.log(`[PLATFORM ADMIN] Platform "${name}" created by ${user.role} ${user.id} with ${documentRequirements.length} document requirements`);

      return {
        success: true,
        message: 'Platform created successfully',
        platform: platform.toObject()
      };
    }

    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    });

  } catch (error: any) {
    console.error('[PLATFORM ADMIN] Error managing platforms:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to manage platforms'
    });
  }
});