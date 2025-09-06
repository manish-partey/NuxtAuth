// server/api/platform/organizations.get.ts
import { defineEventHandler, createError } from 'h3'
import Organization from '~/server/models/Organization'
import { requireRole } from '~/server/middleware/auth'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, ['platform_admin'])

    const currentUser = event.context.user

    if (!currentUser?.platformId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing platformId in user context'
      })
    }

    const organizations = await Organization.find({
      platformId: currentUser.platformId
    })
      .select('_id name slug status createdAt')
      .sort({ createdAt: -1 })
      .lean()

    return {
      success: true,
      organizations
    }
  } catch (err: any) {
    console.error('[API] /platform/organizations error:', err)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load organizations',
      data: err.message || 'Unknown error'
    })
  }
})
