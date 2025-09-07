// server/api/platform/organization/pending.get.ts
import { defineEventHandler, createError, getQuery } from 'h3';
import Organization from '~/server/models/Organization';
import { connectToDatabase } from '~/server/utils/db';
import { getUserFromEvent } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();
    
    // Verify user is platform admin
    const user = await getUserFromEvent(event);
    if (!user || user.role !== 'platform_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only platform admins can view pending organizations'
      });
    }

    const query = getQuery(event);
    const status = query.status || 'pending';

    // Get organizations for this platform admin's platform
    const organizations = await Organization.find({ 
      platformId: user.platformId,
      status: status
    })
    .populate('createdBy', 'name email')
    .populate('platformId', 'name')
    .sort({ createdAt: -1 })
    .lean();

    return {
      success: true,
      organizations: organizations.map(org => ({
        id: (org._id as any).toString(),
        name: org.name,
        type: org.type,
        domain: org.domain,
        status: org.status,
        createdAt: org.createdAt,
        admin: {
          name: (org.createdBy as any)?.name,
          email: (org.createdBy as any)?.email
        },
        platform: {
          name: (org.platformId as any)?.name
        }
      }))
    };

  } catch (err: any) {
    console.error('[API] Pending organizations error:', err);
    
    if (err.statusCode) {
      throw err;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load pending organizations',
    });
  }
});
