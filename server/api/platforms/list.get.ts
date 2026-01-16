// server/api/platforms/list.get.ts
import { defineEventHandler, createError } from 'h3';
import Platform from '~/server/models/Platform';
import { connectToDatabase } from '~/server/utils/db';
import { getUserFromEvent } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();
    
    // Get authenticated user (if any)
    const user = await getUserFromEvent(event);
    
    // Build query based on user role
    let query: any = { status: 'active' };
    
    // Platform admin: only their assigned platform
    if (user?.role === 'platform_admin' && user.platformId) {
      query._id = user.platformId;
    }
    // Organization admin: only their platform
    else if (user?.role === 'organization_admin' && user.platformId) {
      query._id = user.platformId;
    }
    // Super admin: all platforms (no additional filter)
    // Public users: all platforms (no additional filter)
    
    const platforms = await Platform.find(query)
      .select('_id name slug description category')
      .lean();

    return {
      success: true,
      platforms: platforms.map(platform => ({
        id: (platform._id as any).toString(),
        name: platform.name,
        slug: platform.slug,
        description: platform.description,
        category: platform.category
      }))
    };

  } catch (err: any) {
    console.error('[API] Platform list error:', err);
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load platforms',
    });
  }
});
