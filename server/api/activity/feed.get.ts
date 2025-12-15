// server/api/activity/feed.get.ts
import { defineEventHandler, createError, getQuery } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import { connectToDatabase } from '~/server/utils/db';
import AuditLog from '~/server/models/AuditLog';

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();
    
    // Get authenticated user
    const user = await getUserFromEvent(event);
    if (!user || !user.role) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    // Parse query parameters
    const query = getQuery(event);
    const limit = parseInt(query.limit as string) || 50;
    const skip = parseInt(query.skip as string) || 0;
    const action = query.action as string;

    // Build filter based on user role
    let filter: any = {};
    
    switch (user.role) {
      case 'super_admin':
        // Super admin sees all activity
        break;
        
      case 'platform_admin':
        // Platform admin sees activity for their platform
        if (user.platformId) {
          filter.platformId = user.platformId;
        }
        break;
        
      case 'organization_admin':
      case 'manager':
        // Org admin sees activity for their organization
        if (user.organizationId) {
          filter.organizationId = user.organizationId;
        }
        break;
        
      default:
        // Regular users see only their own activity
        filter.userId = user.id;
    }

    // Add action filter if specified
    if (action) {
      filter.action = action;
    }

    // Fetch activities with user population
    const activities = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email role')
      .populate('organizationId', 'name')
      .populate('targetId')
      .lean();

    // Get total count for pagination
    const total = await AuditLog.countDocuments(filter);

    return {
      success: true,
      activities,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + activities.length < total
      }
    };

  } catch (error: any) {
    console.error('[ACTIVITY FEED] Error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch activity feed'
    });
  }
});
