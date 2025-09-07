// server/api/platforms/list.get.ts
import { defineEventHandler, createError } from 'h3';
import Platform from '~/server/models/Platform';
import { connectToDatabase } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();
    
    // Get all active platforms
    const platforms = await Platform.find({ 
      status: 'active' 
    }).select('_id name slug description').lean();

    return {
      success: true,
      platforms: platforms.map(platform => ({
        id: (platform._id as any).toString(),
        name: platform.name,
        slug: platform.slug,
        description: platform.description
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
