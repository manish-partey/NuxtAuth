import { defineEventHandler, createError } from 'h3'
import { getUserFromEvent } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const currentUser = await getUserFromEvent(event)
    if (!currentUser) {
      throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
    }

    // Check if user is organization admin
    if (currentUser.role !== 'organization_admin') {
      return {
        success: false,
        hasOrgAccess: false,
        message: 'User is not an organization administrator'
      }
    }

    // If user has organizationId in their User record, they have access
    if (currentUser.organizationId) {
      return {
        success: true,
        hasOrgAccess: true,
        organizationId: currentUser.organizationId
      }
    }

    return {
      success: false,
      hasOrgAccess: false,
      message: 'User is not a member of any organization'
    }

  } catch (error: any) {
    console.error('[org/users/verify-admin.get] Error:', error)
    throw error.statusCode ? error : createError({
      statusCode: 500,
      statusMessage: 'Failed to verify admin access'
    })
  }
})