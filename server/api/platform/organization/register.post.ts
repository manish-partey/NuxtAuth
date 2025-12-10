// server/api/platform/organization/register.post.ts
import { defineEventHandler, readBody, createError } from 'h3';
import { connectToDatabase } from '~/server/utils/db';
import { createOrganization } from '~/server/services/organization';
import OrganizationType from '~/server/models/OrganizationType';
import Platform from '~/server/models/Platform';

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();
    const body = await readBody(event);
    const { 
      platformId, 
      orgName, 
      organizationTypeId,
      adminName, 
      adminEmail
       
    } = body;

    // Validate required fields
    if (!platformId || !orgName || !organizationTypeId || !adminName || !adminEmail ) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'All fields are required' 
      });
    }

    // Validate platform exists
    const platform = await Platform.findById(platformId);
    if (!platform) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Platform not found'
      });
    }

    // Validate organization type exists and is active
    const orgType = await OrganizationType.findById(organizationTypeId);
    if (!orgType) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Organization type not found'
      });
    }

    if (orgType.status !== 'active') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Selected organization type is not available'
      });
    }

    // Check if org type is allowed for this platform
    if (platform.allowedOrganizationTypes && platform.allowedOrganizationTypes.length > 0) {
      const isAllowed = platform.allowedOrganizationTypes.some(
        (typeId: any) => typeId.toString() === organizationTypeId
      );
      
      if (!isAllowed) {
        throw createError({
          statusCode: 400,
          statusMessage: `Organization type "${orgType.name}" is not allowed for platform "${platform.name}"`
        });
      }
    }

    // Use the simplified organization service
    const result = await createOrganization({
      platformId,
      name: orgName,
      organizationTypeId,
      adminName,
      adminEmail
    });

    // Increment usage count for the org type
    await OrganizationType.findByIdAndUpdate(organizationTypeId, {
      $inc: { usageCount: 1 }
    });

    return { 
      success: true,
      message: `🎉 Registration successful! Your organization "${orgName}" has been submitted for approval.`,
      organizationId: result.organization._id,
      details: {
        organizationName: orgName,
        adminEmail: adminEmail,
        platform: result.platform.name,
        status: 'pending',
        nextSteps: 'Platform administrator will review your registration and send approval notification via email.'
      }
    };

  } catch (err: any) {
    console.error('[API] Platform organization register error:', err);
    
    // Handle specific MongoDB duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      let message = 'This organization already exists';
      
     
      if (field === 'name') {
        message = 'Organization with this name already exists under this platform2';
      } else if (field === 'email') {
        message = 'This email is already registered';
      }
      
      throw createError({
        statusCode: 409,
        statusMessage: message,
      });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      throw createError({
        statusCode: 400,
        statusMessage: err.message,
      });
    }

    // If it's already a createError, re-throw it
    if (err.statusCode) {
      throw err;
    }
    
    // Generic server error
    throw createError({
      statusCode: 500,
      statusMessage: 'Organization registration failed. Please try again.',
    });
  }
});
