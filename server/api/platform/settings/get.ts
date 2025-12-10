// server/api/platform/settings/get.ts
import { defineEventHandler, createError } from 'h3'
import { getUserFromEvent } from '~/server/utils/auth'
import Platform from '~/server/models/Platform'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)

  if (!user || user.role !== 'platform_admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  try {
    if (!user.platformId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing platformId on user' })
    }

    const platform = await Platform.findById(user.platformId).lean()

    if (!platform) {
      throw createError({ statusCode: 404, statusMessage: 'Platform not found' })
    }

    return {
      success: true,
      settings: {
        name: (platform as any).name || '',
        slug: (platform as any).slug || '',
        description: (platform as any).description || '',
        category: (platform as any).category || 'other',
        status: (platform as any).status || 'inactive',
        createdAt: (platform as any).createdAt,
        updatedAt: (platform as any).updatedAt,
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
