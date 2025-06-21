// server/api/org/listAll.ts
import { defineEventHandler, createError } from 'h3';
import { connectToDatabase } from '~/server/utils/db';
import Organization from '~/server/models/Organization';
import { getUserFromEvent } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  await connectToDatabase();

  try {
    // Aggregate organizations and lookup platform name from 'platforms' collection
    const orgs = await Organization.aggregate([
      {
        $lookup: {
          from: 'platforms', // ✅ Corrected from 'organizations' to 'platforms'
          localField: 'platformId',
          foreignField: '_id',
          as: 'platform',
        },
      },
      { $unwind: { path: '$platform', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: 1,
          type: 1,
          platformId: 1,
          platformName: '$platform.name', // ✅ This now works
          status: 1,
          createdAt: 1,
        },
      },
      { $sort: { name: 1 } },
    ]);

    return {
      success: true,
      organizations: orgs,
    };
  } catch (err) {
    console.error('Failed to fetch organizations:', err);
    throw createError({ statusCode: 500, statusMessage: 'Failed to load organizations' });
  }
});
