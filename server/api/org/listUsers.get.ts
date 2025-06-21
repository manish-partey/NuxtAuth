import { defineEventHandler, createError } from 'h3'
import { requireRole } from '~/server/middleware/auth'
import User from '~/server/models/User'
import Organization from '~/server/models/Organization'
import { connectToDatabase } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  await connectToDatabase()

  // Allow only specific roles
  await requireRole(event, ['super_admin', 'platform_admin', 'organization_admin'])

  const url = new URL(event.req.url!, `http://${event.req.headers.host}`)
  const organizationId = url.searchParams.get('organizationId')

  const user = event.context.user

  if (organizationId) {
    // 🔒 If organization_admin, ensure access to their own org only
    if (user.role === 'organization_admin' && user.organizationId !== organizationId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: Not admin of this organization',
      })
    }

    // 🔒 If platform_admin, verify org belongs to their platform
    if (user.role === 'platform_admin') {
      const org = await Organization.findById(organizationId)
      if (!org || org.platformId.toString() !== user.platformId) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Forbidden: Not authorized for this organization',
        })
      }
    }

    // ✅ Return users for a specific organization
    const users = await User.find({ organizationId })
      .select('-password -verificationToken -verificationTokenExpiry')
      .lean()

    return { success: true, users }
  }

  // ✅ No organizationId — return all users (restricted by role)
  let filter: any = {}

  if (user.role === 'platform_admin') {
    filter.platformId = user.platformId
  }

  const users = await User.find(filter)
    .select('-password -verificationToken -verificationTokenExpiry')
    .lean()

  return { success: true, users }
})
