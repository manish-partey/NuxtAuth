// server/api/platform/organizations/[orgId].get.ts
import { defineEventHandler, createError, getRouterParam } from 'h3'
import { requireRole } from '~/server/utils/auth'
import Organization from '~/server/models/Organization'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireRole(event, ['platform_admin'])

    if (!user.platformId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing platformId' })
    }

    const orgId = getRouterParam(event, 'orgId')
    if (!orgId) {
      throw createError({ statusCode: 400, statusMessage: 'Organization ID is required' })
    }

    // Find organization
    const organization = await Organization.findOne({
      _id: orgId,
      platformId: user.platformId
    }).populate('type', 'name code')

    if (!organization) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Organization not found or does not belong to your platform' 
      })
    }

    return {
      success: true,
      organization
    }
  } catch (err: any) {
    console.error('[GET-ORG] Error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to fetch organization'
    })
  }
})
