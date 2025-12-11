// server/api/platform/organizations/[orgId]/reject.post.ts
import { defineEventHandler, createError, getRouterParam, readBody } from 'h3'
import { requireRole } from '~/server/utils/auth'
import Organization from '~/server/models/Organization'
import User from '~/server/models/User'
import { sendEmail, emailTemplates } from '~/server/utils/email'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireRole(event, ['platform_admin'])

    if (!user.platformId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing platformId' })
    }

    const orgId = getRouterParam(event, 'orgId')
    if (!orgId) {
      throw createError({ statusCode: 400, statusMessage: 'Organization ID is required' })
    }

    const body = await readBody(event)
    const { reason } = body

    if (!reason || reason.trim().length < 10) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Rejection reason is required (minimum 10 characters)' 
      })
    }

    console.log('[REJECT-ORG] Platform admin attempting to reject:', orgId)

    // Find organization
    const organization = await Organization.findOne({
      _id: orgId,
      platformId: user.platformId
    })

    if (!organization) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Organization not found or does not belong to your platform' 
      })
    }

    // Check if already processed (concurrency control)
    if (organization.status === 'approved') {
      throw createError({ 
        statusCode: 409, 
        statusMessage: 'Organization already approved. Cannot reject approved organizations.' 
      })
    }

    if (organization.status === 'rejected') {
      throw createError({ 
        statusCode: 409, 
        statusMessage: 'Organization already rejected' 
      })
    }

    // Reject organization
    organization.status = 'rejected'
    organization.rejectedBy = user.id as any
    organization.rejectedAt = new Date()
    organization.rejectionReason = reason.trim()
    await organization.save()

    console.log('[REJECT-ORG] Organization rejected:', organization.name, 'Reason:', reason)

    // Send email notification to organization creator
    try {
      const creator = await User.findById(organization.createdBy)
      if (creator && creator.email) {
        await sendEmail({
          to: creator.email,
          ...emailTemplates.organizationRejected({
            organizationName: organization.name,
            registrantName: creator.name,
            reason: organization.rejectionReason || 'No reason provided'
          })
        })
        console.log('[REJECT-ORG] Rejection email sent to:', creator.email)
      }
    } catch (emailError) {
      console.error('[REJECT-ORG] Failed to send rejection email:', emailError)
      // Don't fail the rejection if email fails
    }

    return {
      success: true,
      message: 'Organization rejected',
      organization: {
        _id: organization._id,
        name: organization.name,
        status: organization.status,
        rejectedAt: organization.rejectedAt,
        rejectionReason: organization.rejectionReason
      }
    }
  } catch (err: any) {
    console.error('[REJECT-ORG] Error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to reject organization'
    })
  }
})
