// server/api/platform/organization/details.get.ts
import { defineEventHandler, getQuery, createError } from 'h3';
import Organization from '~/server/models/Organization';
import User from '~/server/models/User';
import Platform from '~/server/models/Platform';
import { connectToDatabase } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();
    const { orgId } = getQuery(event);

    if (!orgId) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Organization ID is required' 
      });
    }

    // Get organization with populated data
    const organization = await Organization.findById(orgId);
    if (!organization) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Organization not found' 
      });
    }

    // Get admin user details
    const adminUser = await User.findById(organization.createdBy);
    if (!adminUser) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Organization admin not found' 
      });
    }

    // Get platform details
    const platform = await Platform.findById(organization.platformId);
    if (!platform) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Platform not found' 
      });
    }

    return { 
      success: true,
      organization: {
        id: organization._id,
        name: organization.name,
        type: organization.type,
        domain: organization.domain,
        status: organization.status,
        createdAt: organization.createdAt,
        adminName: adminUser.name,
        adminEmail: adminUser.email,
        platformName: platform.name,
        platformId: platform._id
      }
    };

  } catch (error: any) {
    console.error('[API] Organization details error:', error);
    throw createError({ 
      statusCode: error.statusCode || 500, 
      statusMessage: error.statusMessage || 'Failed to get organization details' 
    });
  }
});
