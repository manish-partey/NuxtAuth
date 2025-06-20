// server/api/org/invites.get.ts
import { defineEventHandler, createError } from 'h3'
import { connectToDatabase } from '~/server/utils/db'
import Invitation from '~/server/models/Invitation'
import Organization from '~/server/models/Organization'
import { getUserFromEvent } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  await connectToDatabase()

  try {
    let invites;

    if (user.role === 'super_admin') {
      // Super admin sees all invites with org and platform names

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
      ])
    } else {
      // For org or platform admins, limit to their org invites

      const orgId = user.organizationId
      if (!orgId) {
        throw createError({ statusCode: 400, statusMessage: 'User has no organization' })
      }

      invites = await Invitation.find({ organizationId: orgId })
        .sort({ createdAt: -1 })
        .lean()
    }

    return {
      success: true,
      invites,
    }
  } catch (err) {
    console.error('Error fetching invites:', err)
    throw createError({ statusCode: 500, statusMessage: 'Failed to load invites' })
  }
})
