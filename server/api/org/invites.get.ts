// server/api/org/invites.get.ts
import { defineEventHandler, createError } from 'h3'
import { connectToDatabase } from '~/server/utils/db'
import Invitation from '~/server/models/Invitation'
import { getUserFromEvent } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  await connectToDatabase()

  const orgId = user.organizationId
  if (!orgId) {
    throw createError({ statusCode: 400, statusMessage: 'User has no organization' })
  }

  try {
    const invites = await Invitation.find({ organizationId: orgId })
      .sort({ createdAt: -1 })
      .lean()

    return {
      success: true,
      invites,
    }
  } catch (err) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load invites' })
  }
})
