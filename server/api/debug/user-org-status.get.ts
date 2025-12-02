import { defineEventHandler, createError } from 'h3'
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

    // Get full user details
    const fullUser = await User.findById(currentUser.id).lean() as ({ _id?: string; email?: string; name?: string; role?: string; organizationId?: string; isVerified?: boolean }) | null
    
    // Get all organizations
    const organizations = await Organization.find({}).lean()

    // Check if user is mentioned in any organization
    const userInOrgs = organizations.filter(org => 
      org.members?.some((member: any) => member.userId.toString() === currentUser.id.toString()) ||
      org.createdBy?.toString() === currentUser.id.toString()
    )

    return {
      success: true,
      currentUser: {
        _id: Array.isArray(fullUser) ? undefined : fullUser?._id,
        email: !Array.isArray(fullUser) ? fullUser?.email : undefined,
        name: fullUser?.name,
        role: fullUser?.role,
        organizationId: fullUser?.organizationId,
        isVerified: fullUser?.isVerified
      },
      organizations: organizations.map(org => ({
        _id: org._id,
        name: org.name,
        createdBy: org.createdBy,
        members: org.members
      })),
      userFoundInOrgs: userInOrgs.map(org => ({
        _id: org._id,
        name: org.name,
        isCreator: org.createdBy?.toString() === currentUser.id.toString(),
        memberRole: org.members?.find((m: any) => m.userId.toString() === currentUser.id.toString())?.role
      }))
    }

  } catch (error: any) {
    console.error('[debug/user-org-status] Error:', error)
    throw error.statusCode ? error : createError({
      statusCode: 500,
      statusMessage: 'Debug failed'
    })
  }
})