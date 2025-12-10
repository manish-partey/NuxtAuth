import { defineEventHandler, createError, getRouterParam } from 'h3'
import { getUserFromEvent } from '~/server/utils/auth'
import User from '~/server/models/User'
import { sendEmail } from '~/server/utils/mail'

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const currentUser = await getUserFromEvent(event)
    if (!currentUser) {
      throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
    }

    // Check if user is organization admin
    if (currentUser.role !== 'organization_admin') {
      throw createError({ statusCode: 403, statusMessage: 'Only organization administrators can delete users' })
    }

    // Get user ID from URL parameters
    const userId = getRouterParam(event, 'id')
    if (!userId) {
      throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
    }

    // Prevent self-deletion
    if (userId === currentUser.id.toString()) {
      throw createError({ statusCode: 403, statusMessage: 'Cannot delete yourself from the organization' })
    }

    // Find target user in same organization
    const targetUser = await User.findOne({
      _id: userId,
      organizationId: currentUser.organizationId
    })

    if (!targetUser) {
      throw createError({ statusCode: 404, statusMessage: 'User not found in organization' })
    }

    // For users with invitation_sent status, we can hard delete them
    // For active users, we should soft delete (disable them)
    if (targetUser.status === 'invitation_sent') {
      // Hard delete - they never actually joined
      await User.deleteOne({ _id: userId })
      
      return {
        success: true,
        message: `Invitation for ${targetUser.email} has been revoked`,
        action: 'deleted'
      }
    } else {
      // Soft delete - disable the user
      targetUser.disabled = true
      targetUser.status = 'suspended'
      await targetUser.save()

      // Send notification email
      try {
        const emailSubject = `Account Suspended`
        const emailContent = `
Hello ${targetUser.name},

Your account has been suspended by the organization administrator.

If you believe this is a mistake, please contact the organization administrator.

Best regards,
Organization Team
        `.trim()

        await sendEmail(targetUser.email, emailSubject, emailContent)
      } catch (emailError) {
        console.error('Failed to send suspension notification email:', emailError)
      }

      return {
        success: true,
        message: `User ${targetUser.name} has been suspended`,
        action: 'suspended'
      }
    }

  } catch (error: any) {
    console.error('[org/users/[id].delete] Error:', error)
    throw error.statusCode ? error : createError({
      statusCode: 500,
      statusMessage: 'Failed to delete user',
      data: error.message
    })
  }
})
