import { defineEventHandler, createError, getRouterParam, readBody } from 'h3'
import { getUserFromEvent } from '~/server/utils/auth'
import User from '~/server/models/User'
import { sendEmail } from '~/server/utils/email'

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const currentUser = await getUserFromEvent(event)
    if (!currentUser) {
      throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
    }

    // Check if user is organization admin
    if (currentUser.role !== 'organization_admin') {
      throw createError({ statusCode: 403, statusMessage: 'Only organization administrators can remove users' })
    }

    // Get user ID from URL parameters
    const userId = getRouterParam(event, 'userId')
    if (!userId) {
      throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
    }

    // Prevent self-removal
    if (userId === currentUser.id.toString()) {
      throw createError({ statusCode: 403, statusMessage: 'Cannot remove yourself from the organization' })
    }

    // Get optional reason from request body (may be empty for DELETE requests)
    let reason = null
    try {
      const body = await readBody(event)
      reason = body?.reason || null
    } catch {
      // No body in request, which is normal for DELETE
      reason = null
    }

    // Find target user in same organization
    const targetUser = await User.findOne({
      _id: userId,
      organizationId: currentUser.organizationId,
      disabled: { $ne: true }
    })

    if (!targetUser) {
      throw createError({ statusCode: 404, statusMessage: 'User not found in organization' })
    }

    // Prevent removing other admins
    if (targetUser.role === 'organization_admin') {
      throw createError({ statusCode: 403, statusMessage: 'Cannot remove organization administrators' })
    }

    // Remove user from organization (soft delete by disabling)
    targetUser.disabled = true
    await targetUser.save()

    // Send notification email (optional)
    try {
      const emailSubject = `Removed from Organization`
      const emailContent = `
Hello,

You have been removed from the organization by ${currentUser.name}.

${reason ? `Reason: ${reason}` : ''}

If you believe this is a mistake, please contact the organization administrator.

Best regards,
Organization Team
      `.trim()

      await sendEmail(targetUser.email, emailSubject, emailContent)
    } catch (emailError) {
      console.error('Failed to send removal notification email:', emailError)
      // Don't fail the removal if email fails
    }

    return {
      success: true,
      message: `User ${targetUser.name} removed from organization`,
      removedUser: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        removedAt: new Date(),
        reason: reason || null
      }
    }

  } catch (error: any) {
    console.error('[org/users/[userId]/remove.delete] Error:', error)
    throw error.statusCode ? error : createError({
      statusCode: 500,
      statusMessage: 'Failed to remove user from organization',
      data: error.message
    })
  }
})