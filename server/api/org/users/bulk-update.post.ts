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

    // Check if user is organization admin
    if (currentUser.role !== 'organization_admin') {
      throw createError({ statusCode: 403, statusMessage: 'Only organization administrators can perform bulk operations' })
    }

    const body = await readBody(event)
    const { userIds, action, payload } = body

    // Validation
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'User IDs array is required' })
    }

    if (userIds.length > 50) {
      throw createError({ statusCode: 400, statusMessage: 'Maximum 50 users allowed in bulk operation' })
    }

    const validActions = ['update_role', 'suspend', 'activate', 'remove']
    if (!action || !validActions.includes(action)) {
      throw createError({ statusCode: 400, statusMessage: 'Valid action is required (update_role, suspend, activate, remove)' })
    }

    // Prevent self-operations
    if (userIds.includes(currentUser.id.toString())) {
      throw createError({ statusCode: 403, statusMessage: 'Cannot perform bulk operations on yourself' })
    }

    // Validate payload for role updates
    if (action === 'update_role') {
      const validRoles = ['organization_admin', 'manager', 'employee', 'guest', 'user']
      if (!payload?.role || !validRoles.includes(payload.role)) {
        throw createError({ statusCode: 400, statusMessage: 'Valid role is required for role updates' })
      }
    }

    // Get users in the same organization
    const organizationId = currentUser.organizationId
    const targetUsers = await User.find({
      _id: { $in: userIds },
      organizationId: organizationId,
      disabled: { $ne: true }
    })

    if (targetUsers.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'No valid users found' })
    }

    console.log(`[bulk-update] Processing ${action} for ${targetUsers.length} users`)

    const results = []
    let updateData = {}

    switch (action) {
      case 'update_role':
        updateData = { role: payload.role }
        break
      case 'suspend':
        updateData = { disabled: true }
        break
      case 'activate':
        updateData = { disabled: false }
        break
      case 'remove':
        updateData = { disabled: true } // Soft delete by disabling
        break
    }

    // Perform bulk update
    const bulkResult = await User.updateMany(
      {
        _id: { $in: targetUsers.map(u => u._id) },
        organizationId: organizationId
      },
      updateData
    )

    console.log(`[bulk-update] Updated ${bulkResult.modifiedCount} users`)

    return {
      success: true,
      message: `Successfully ${action.replace('_', ' ')}d ${bulkResult.modifiedCount} user(s)`,
      modifiedCount: bulkResult.modifiedCount,
      requestedCount: userIds.length,
      action: action
    }

  } catch (error: any) {
    console.error('[org/users/bulk-update.post] Error:', error)
    throw error.statusCode ? error : createError({
      statusCode: 500,
      statusMessage: 'Failed to perform bulk operation',
      data: error.message
    })
  }
})