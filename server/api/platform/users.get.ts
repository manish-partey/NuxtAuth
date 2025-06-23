// server/api/platform/users.get.ts
import { defineEventHandler, createError } from 'h3'
import { getUserFromEvent } from '~/server/utils/auth'
import User from '~/server/models/User'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)

  if (!user || user.role !== 'platform_admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  try {
    const users = await User.find({ platformId: user.platformId })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean()

    return {
      success: true,
      data: users,
    }
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch platform users',
      data: err.message,
    })
  }
})