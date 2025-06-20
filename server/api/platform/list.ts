// server/api/platform/list.ts
import { defineEventHandler, createError } from 'h3';
import { connectToDatabase } from '~/server/utils/db';
import Platform from '~/server/models/Platform';
import { getUserFromEvent } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  await connectToDatabase();

  try {
    const platformsRaw = await Platform.find({})
      .sort({ createdAt: -1 })
      .lean();

    const platforms = platformsRaw.map((p) => ({
      _id: p._id,
      name: p.name,
      description: p.description || '',
      type: 'platform', // fallback static value
      status: 'active', // fallback static value
      createdAt: p.createdAt,
    }));

    return {
      success: true,
      platforms,
    };
  } catch (err) {
    console.error('Failed to fetch platforms:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load platforms',
    });
  }
});
