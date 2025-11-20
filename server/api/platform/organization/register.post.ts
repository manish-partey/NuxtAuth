// server/api/platform/organization/register.post.ts
import { defineEventHandler, readBody, createError } from 'h3';
import { connectToDatabase } from '~/server/utils/db';
import { createOrganization } from '~/server/services/organization';

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();
    const body = await readBody(event);
    const { 
      platformId, 
      orgName, 
      orgType,
      adminName, 
      adminEmail
       
    } = body;

    // Validate required fields
    if (!platformId || !orgName || !orgType || !adminName || !adminEmail ) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'All fields are required' 
      });
    }

    // Use the simplified organization service
    const result = await createOrganization({
      platformId,
      name: orgName,
      type: orgType,
      adminName,
      adminEmail
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
