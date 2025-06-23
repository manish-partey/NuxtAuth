import { defineEventHandler, createError } from 'h3'
import { getUserFromEvent } from '~/server/utils/auth'
import Platform from '~/server/models/Platform'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)

  if (!user || user.role !== 'platform_admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  try {
    const platform = await Platform.findById(user.platformId).lean()

    if (!platform) {
      throw createError({ statusCode: 404, statusMessage: 'Platform not found' })
    }

    return {
      success: true,
      data: {
        name: platform.name,
        slug: platform.slug,
        createdAt: platform.createdAt,
        updatedAt: platform.updatedAt,
      },
    }
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch platform settings',
      data: err.message,
    })
  }
})
