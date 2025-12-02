import { defineEventHandler, createError, readBody } from 'h3'
import { getUserFromEvent } from '~/server/utils/auth'
import User from '~/server/models/User'
import Organization from '~/server/models/Organization'

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const currentUser = await getUserFromEvent(event)
    if (!currentUser) {
      throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
    }

    // Check if user already has organizationId
    if (currentUser.organizationId) {
      return {
        success: true,
        message: 'User already has organization access',
        organizationId: currentUser.organizationId
      }
    }

    // Find organizations where this user is a member or creator
    const organizations = await Organization.find({
      $or: [
        { createdBy: currentUser.id },
        { 'members.userId': currentUser.id }
      ]
    }).lean()

    if (organizations.length === 0) {
      return {
        success: false,
        message: 'No organizations found for this user. Please create or join an organization first.',
        organizations: []
      }
    }

    // Take the first organization (or could prompt user to choose)
    const targetOrg = organizations[0]

    // Update user with organizationId
    await User.findByIdAndUpdate(currentUser.id, {
      organizationId: targetOrg._id
    })

    // Also ensure user's role is correct
    if (currentUser.role !== 'organization_admin') {
      await User.findByIdAndUpdate(currentUser.id, {
        role: 'organization_admin'
      })
    }

    return {
      success: true,
      message: `User successfully associated with organization: ${targetOrg.name}`,
      organizationId: targetOrg._id,
      organizationName: targetOrg.name,
      availableOrganizations: organizations.map(org => ({
        _id: org._id,
        name: org.name,
        isCreator: org.createdBy?.toString() === currentUser.id.toString()
      }))
    }

  } catch (error: any) {
    console.error('[fix/user-org-association] Error:', error)
    throw error.statusCode ? error : createError({
      statusCode: 500,
      statusMessage: 'Failed to fix user organization association'
    })
  }
})