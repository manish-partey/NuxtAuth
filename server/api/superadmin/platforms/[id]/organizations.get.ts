// server/api/superadmin/platforms/[id]/organizations.get.ts
import { defineEventHandler, createError } from 'h3';
import { requireRole } from '~/server/utils/auth';
import { connectToDatabase } from '~/server/utils/db';
import Organization from '~/server/models/Organization';
import User from '~/server/models/User';
import OrganizationType from '~/server/models/OrganizationType';

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();
    
    // Require super_admin authentication
    await requireRole(event, ['super_admin']);
    
    const platformId = event.context.params?.id;
    
    if (!platformId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Platform ID is required'
      });
    }
    
    // Get all organizations for this platform with aggregation
    const organizations = await Organization.aggregate([
      {
        $match: {
          platformId: new (await import('mongoose')).default.Types.ObjectId(platformId)
        }
      },
      {
        $lookup: {
          from: 'organizationTypes',
          localField: 'type',
          foreignField: '_id',
          as: 'organizationType'
        }
      },
      {
        $unwind: {
          path: '$organizationType',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);
    
    // Get user counts for each organization
    const organizationsWithCounts = await Promise.all(
      organizations.map(async (org) => {
        const userCount = await User.countDocuments({ organizationId: org._id });
        
        return {
          _id: org._id,
          name: org.name,
          description: org.description || '',
          slug: org.slug,
          status: org.status,
          type: org.organizationType?.name || 'Not Set',
          typeIcon: org.organizationType?.icon || '📋',
          userCount,
          createdAt: org.createdAt
        };
      })
    );
    
    return {
      success: true,
      organizations: organizationsWithCounts,
      total: organizationsWithCounts.length
    };
    
  } catch (error: any) {
    console.error('[SUPERADMIN-PLATFORM-ORGS] Error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch platform organizations'
    });
  }
});
