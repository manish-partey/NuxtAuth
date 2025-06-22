// server/api/org/invites.get.ts
import { defineEventHandler, createError } from 'h3';
import { connectToDatabase } from '~/server/utils/db';
import Invitation from '~/server/models/Invitation';
import Organization from '~/server/models/Organization';
import { getUserFromEvent } from '~/server/utils/auth';

import { defaultClient } from 'applicationinsights';

export default defineEventHandler(async (event) => {
  try {
  const user = await getUserFromEvent(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  await connectToDatabase();
  console.log('[INVITES API] Logged in user:', user);

  try {
    let invites;

    if (user.role === 'super_admin') {
      invites = await Invitation.aggregate([
        {
          $lookup: {
            from: 'organizations',
            localField: 'organizationId',
            foreignField: '_id',
            as: 'organization',
          },
        },
        { $unwind: '$organization' },
        {
          $lookup: {
            from: 'organizations',
            localField: 'organization.platformId',
            foreignField: '_id',
            as: 'platform',
          },
        },
        { $unwind: { path: '$platform', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            email: 1,
            role: 1,
            status: 1,
            createdAt: 1,
            organizationId: 1,
            organizationName: '$organization.name',
            platformName: '$platform.name',
          },
        },
        { $sort: { createdAt: -1 } },
      ]);
    } else if (user.role === 'platform_admin') {
      const orgs = await Organization.find({ platformId: user.platformId }, { _id: 1 }).lean();
      const orgIds = orgs.map((org) => org._id);
      invites = await Invitation.find({ organizationId: { $in: orgIds } })
        .sort({ createdAt: -1 })
        .lean();
    } else if (user.role === 'organization_admin') {
      if (!user.organizationId) {
        throw createError({ statusCode: 400, statusMessage: 'User has no organization ID' });
      }

      invites = await Invitation.find({ organizationId: user.organizationId })
        .sort({ createdAt: -1 })
        .lean();
    } else {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
    }

    return {
      success: true,
      invites,
    };
  } catch (err: any) {
    console.error('Error fetching invites:', err?.message || err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load invites',
      data: err?.message || 'Unknown error',
    });
  }
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});
