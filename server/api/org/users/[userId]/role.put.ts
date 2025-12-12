import { defineEventHandler, createError, readBody, getRouterParam } from 'h3'
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
      throw createError({ statusCode: 403, statusMessage: 'Only organization administrators can update user roles' })
    }

    // Get user ID from URL parameters
    const userId = getRouterParam(event, 'userId')
    if (!userId) {
      throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
    }

    // Prevent self-role change
    if (userId === currentUser.id.toString()) {
      throw createError({ statusCode: 403, statusMessage: 'Cannot change your own role' })
    }

    const body = await readBody(event)
    const { role } = body

    // Validate role (organization-level roles only)
    const validRoles = ['organization_admin', 'manager', 'employee', 'guest']
    if (!role || !validRoles.includes(role)) {
      throw createError({ statusCode: 400, statusMessage: 'Valid role is required (organization_admin, manager, employee, guest)' })
    }

    // Find target user in same organization
    const targetUser = await User.findOne({
      _id: userId,
      organizationId: currentUser.organizationId
    })

    if (!targetUser) {
      throw createError({ statusCode: 404, statusMessage: 'User not found in organization' })
    }

    // Prevent admin from demoting another admin
    if (targetUser.role === 'organization_admin' && role !== 'organization_admin') {
      throw createError({ statusCode: 403, statusMessage: 'Cannot demote organization administrators' })
    }

    // Update role
    const oldRole = targetUser.role
    targetUser.role = role
    await targetUser.save()

    return {
      success: true,
      message: `User role updated from ${oldRole} to ${role}`,
      user: {
        _id: targetUser._id,
        role: targetUser.role,
        name: targetUser.name,
        email: targetUser.email
      }
    }

  } catch (error: any) {
    console.error('[org/users/[userId]/role.put] Error:', error)
    throw error.statusCode ? error : createError({
      statusCode: 500,
      statusMessage: 'Failed to update user role',
      data: error.message
    })
  }
})