// server/api/platform/organizations/[orgId]/users.get.ts
import { defineEventHandler, createError, getRouterParam } from 'h3'
import { requireRole } from '~/server/utils/auth'
import Organization from '~/server/models/Organization'
import User from '~/server/models/User'

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

    // Verify organization belongs to platform
    const organization = await Organization.findOne({
      _id: orgId,
      platformId: user.platformId
    })

    if (!organization) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Organization not found or does not belong to your platform' 
      })
    }

    // Fetch all users in this organization
    const users = await User.find({ organizationId: orgId })
      .select('name email role status createdAt')
      .sort({ createdAt: -1 })

    return {
      success: true,
      users
    }
  } catch (err: any) {
    console.error('[GET-ORG-USERS] Error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to fetch organization users'
    })
  }
})
