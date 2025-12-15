// server/api/platform/organizations.get.ts
import { defineEventHandler, createError } from 'h3'
import Organization from '~/server/models/Organization'
import { requireRole } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, ['platform_admin'])

    const currentUser = event.context.user
    console.log('[PLATFORM-ORGS] User:', currentUser?.role, 'Platform:', currentUser?.platformId)

    if (!currentUser?.platformId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing platformId in user context'
      })
    }

    console.log('[PLATFORM-ORGS] Fetching organizations for platform:', currentUser.platformId)
    const organizations = await Organization.find({
      platformId: currentUser.platformId
    })
      .populate('type', 'name code')
      .select('_id name slug status createdAt type')
      .sort({ createdAt: -1 })
      .lean()

    console.log('[PLATFORM-ORGS] Found', organizations.length, 'organizations')

    // Add user count for each organization
    const User = (await import('~/server/models/User')).default;
    const orgsWithUserCount = await Promise.all(
      organizations.map(async (org: any) => {
        const userCount = await User.countDocuments({ organizationId: org._id });
        return {
          ...org,
          type: org.type?.name || org.type?.code || 'unknown',
          userCount
        };
      })
    );

    return {
      success: true,
      organizations: orgsWithUserCount
    }
  } catch (err: any) {
    console.error('[PLATFORM-ORGS] Error:', err)
    console.error('[PLATFORM-ORGS] Error stack:', err.stack)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load organizations: ' + err.message,
      data: err.message || 'Unknown error'
    })
  }
})
