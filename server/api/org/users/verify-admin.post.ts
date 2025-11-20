import { defineEventHandler, createError, readBody } from 'h3'
import { getUserFromEvent } from '~/server/utils/auth'
import User from '~/server/models/User'

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const currentUser = await getUserFromEvent(event)
    if (!currentUser) {
      throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
    }

    const body = await readBody(event)
    const { userId, organizationId } = body

    // Validate inputs
    if (!userId || !organizationId) {
      throw createError({ statusCode: 400, statusMessage: 'User ID and Organization ID are required' })
    }

    // Check if the user is an organization admin
    const user = await User.findOne({
      _id: userId,
      organizationId: organizationId,
      role: 'organization_admin'
    })

    return {
      success: true,
      data: {
        isAdmin: !!user,
        role: user?.role || null
      }
    }

  } catch (error: any) {
    console.error('[org/users/verify-admin] Error:', error)
    throw error.statusCode ? error : createError({
      statusCode: 500,
      statusMessage: 'Failed to verify admin status',
      data: error.message
    })
  }
})