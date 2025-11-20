import { defineEventHandler, createError, getQuery } from 'h3'
import { getUserFromEvent } from '~/server/utils/auth'
import User from '~/server/models/User'

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const currentUser = await getUserFromEvent(event)
    if (!currentUser) {
      throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
    }

    // Get the user's organization ID
    const organizationId = currentUser.organizationId
    if (!organizationId) {
      console.error(`[list.get] User ${currentUser.email} has no organizationId`)
      throw createError({ statusCode: 403, statusMessage: 'Access denied: No organization associated with this account' })
    }

    // Get query parameters
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = Math.min(parseInt(query.limit as string) || 10, 100) // Max 100 per page
    const role = query.role as string
    const status = query.status as string
    const search = query.search as string

    // Build filter for users in the same organization
    const filter: any = {
      organizationId: organizationId,
      isVerified:{$ne : false},
      disabled: { $ne: true }, // Don't show disabled users
      role: { $nin: ['super_admin'] } // Don't show admin roles
    }

    // Add role filter
    if (role) {
      filter.role = role 
    }

    // Add search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get total count
    const total = await User.countDocuments(filter)

    // Get users with pagination
    const users = await User.find(filter)
      .select('_id name email role isVerified createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Calculate pagination info
    const pages = Math.ceil(total / limit)

    console.log(`[list.get] Found ${users.length} users for organization ${organizationId}`)

    return {
      success: true,
      users: users.map(user => ({
        _id: user._id,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified
        },
        role: user.role,
        status: user.disabled ? 'suspended' : 'active',
        joinedAt: user.createdAt,
        permissions: {},
        createdAt: user.createdAt
      })),
      pagination: {
        current: page,
        total: total,
        pages: pages,
        hasNext: page < pages,
        hasPrev: page > 1
      }
    }

  } catch (error: any) {
    console.error('[org/users/list.get] Error:', error)
    throw error.statusCode ? error : createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch organization users',
      data: error.message
    })
  }
})