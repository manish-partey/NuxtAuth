// server/api/platform/pending-organizations.get.ts
import { defineEventHandler, createError, getQuery } from 'h3'
import { requireRole } from '~/server/utils/auth'
import Organization from '~/server/models/Organization'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireRole(event, ['platform_admin'])

    if (!user.platformId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing platformId' })
    }

    const query = getQuery(event)
    const status = query.status as string || 'pending'

    console.log('[PENDING-ORGS] Fetching organizations with status:', status, 'for platform:', user.platformId)

    // Build query
    const searchQuery: any = {
      platformId: user.platformId
    }

    if (status === 'all') {
      // Show all organizations
    } else if (['pending', 'approved', 'rejected'].includes(status)) {
      searchQuery.status = status
    } else {
      throw createError({ statusCode: 400, statusMessage: 'Invalid status filter' })
    }

    const organizations = await Organization.find(searchQuery)
      .populate('type', 'name code icon')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .select('_id name slug status description createdAt approvedAt rejectedAt rejectionReason type createdBy approvedBy rejectedBy')
      .sort({ createdAt: -1 })
      .lean()

    console.log('[PENDING-ORGS] Found', organizations.length, 'organizations')

    return {
      success: true,
      organizations: organizations.map((org: any) => ({
        ...org,
        typeName: org.type?.name || 'Unknown',
        createdByName: org.createdBy?.name || 'Unknown',
        createdByEmail: org.createdBy?.email || 'Unknown',
        approvedByName: org.approvedBy?.name || null,
        rejectedByName: org.rejectedBy?.name || null
      }))
    }
  } catch (err: any) {
    console.error('[PENDING-ORGS] Error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to fetch organizations'
    })
  }
})
