import { defineEventHandler, createError, readBody } from 'h3'
import { getUserFromEvent } from '~/server/utils/auth'
import Organization from '~/server/models/Organization'

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const currentUser = await getUserFromEvent(event)
    if (!currentUser) {
      throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
    }

    // Check if user is organization admin
    if (currentUser.role !== 'organization_admin') {
      throw createError({ statusCode: 403, statusMessage: 'Only organization administrators can update settings' })
    }

    // Get user's organization
    const organizationId = currentUser.organizationId
    if (!organizationId) {
      throw createError({ statusCode: 403, statusMessage: 'No organization associated with your account' })
    }

    // Get request body
    const body = await readBody(event)
    const { name, type, settings } = body

    // Find organization
    const organization = await Organization.findById(organizationId)
    if (!organization) {
      throw createError({ statusCode: 404, statusMessage: 'Organization not found' })
    }

    // Update fields if provided
    if (name && name.trim()) {
      // Check if name is being changed and if new name already exists
      if (name !== organization.name) {
        const existingOrg = await Organization.findOne({
          name,
          platformId: organization.platformId,
          _id: { $ne: organizationId }
        })
        
        if (existingOrg) {
          throw createError({ 
            statusCode: 409, 
            statusMessage: 'An organization with this name already exists on this platform' 
          })
        }
        organization.name = name.trim()
      }
    }

    if (type && type.trim()) {
      organization.type = type.trim()
    }

    if (settings) {
      organization.settings = settings
    }

    await organization.save()

    return {
      success: true,
      message: 'Organization updated successfully',
      organization: {
        id: organization._id,
        name: organization.name,
        type: organization.type,
        slug: organization.slug,
        status: organization.status,
        settings: organization.settings
      }
    }

  } catch (error: any) {
    console.error('[org/update.post] Error:', error)
    throw error.statusCode ? error : createError({
      statusCode: 500,
      statusMessage: 'Failed to update organization',
      data: error.message
    })
  }
})
