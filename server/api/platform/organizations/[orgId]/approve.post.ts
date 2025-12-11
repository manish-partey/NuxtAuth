// server/api/platform/organizations/[orgId]/approve.post.ts
import { defineEventHandler, createError, getRouterParam } from 'h3'
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

    console.log('[APPROVE-ORG] Platform admin attempting to approve:', orgId)

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
      const approver = await (await import('~/server/models/User')).default
        .findById(organization.approvedBy)
        .select('name email')
      
      throw createError({ 
        statusCode: 409, 
        statusMessage: `Organization already approved by ${approver?.name || 'another admin'} on ${organization.approvedAt?.toLocaleString()}` 
      })
    }

    if (organization.status === 'rejected') {
      throw createError({ 
        statusCode: 409, 
        statusMessage: 'Organization was rejected. Cannot approve rejected organizations.' 
      })
    }

    // Approve organization
    organization.status = 'approved'
    organization.approvedBy = user.id as any
    organization.approvedAt = new Date()
    await organization.save()

    console.log('[APPROVE-ORG] Organization approved:', organization.name)

    // Activate user account and send approval email with password reset link
    try {
      const creator = await User.findById(organization.createdBy)
      console.log('[APPROVE-ORG] Creator found:', creator ? { email: creator.email, name: creator.name, id: creator._id } : 'NOT FOUND')
      
      if (creator) {
        // Activate user account
        creator.status = 'active'
        
        // Generate new reset token if the old one expired or doesn't exist
        const now = new Date()
        let resetToken = creator.resetPasswordToken
        let needsNewToken = false
        
        if (!resetToken || !creator.resetPasswordExpiry || creator.resetPasswordExpiry < now) {
          const { v4: uuidv4 } = await import('uuid')
          resetToken = uuidv4()
          creator.resetPasswordToken = resetToken
          creator.resetPasswordExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
          needsNewToken = true
        }
        
        await creator.save()
        console.log('[APPROVE-ORG] User account activated:', creator.email)
        
        if (creator.email) {
          const config = useRuntimeConfig()
          const baseUrl = config.public.appUrl || config.public.baseUrl || 'http://localhost:3000'
          const resetLink = `${baseUrl}/reset-password?token=${resetToken}`
          
          console.log('[APPROVE-ORG] About to send email to:', creator.email)
          console.log('[APPROVE-ORG] Reset link:', resetLink)
          
          await sendEmail({
            to: creator.email,
            subject: `Organization Approved: ${organization.name} - Set Your Password`,
            html: `
              <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                <h2 style="color: #10B981;">🎉 Congratulations! Your Organization Has Been Approved</h2>
                <p>Dear ${creator.name},</p>
                <p>Great news! Your organization <strong>${organization.name}</strong> has been approved and is now active.</p>
                <p><strong>Next Step:</strong> Please set your password to access your account:</p>
                <p style="margin: 30px 0;">
                  <a href="${resetLink}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Set Your Password</a>
                </p>
                <p><strong>Note:</strong> This link will expire in 24 hours.</p>
                <p>Once you've set your password, you can login and start managing your organization.</p>
                <p style="margin-top: 30px;">
                  <a href="${baseUrl}/login" style="color: #3b82f6;">Go to Login Page</a>
                </p>
                <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #777;">Welcome aboard!<br>The Platform Team</p>
              </div>
            `,
            text: `Congratulations! Your Organization Has Been Approved\n\nDear ${creator.name},\n\nYour organization ${organization.name} has been approved and is now active.\n\nPlease set your password by visiting: ${resetLink}\n\nThis link will expire in 24 hours.\n\nOnce you've set your password, you can login at: ${baseUrl}/login\n\nWelcome aboard!`
          })
          console.log('[APPROVE-ORG] Approval email with password reset link sent to:', creator.email)
          if (needsNewToken) {
            console.log('[APPROVE-ORG] New password reset token generated (old one expired)')
          }
        }
      }
    } catch (emailError: any) {
      console.error('[APPROVE-ORG] Failed to activate user or send approval email:', emailError)
      console.error('[APPROVE-ORG] Error details:', {
        message: emailError.message,
        stack: emailError.stack,
        name: emailError.name
      })
      // Don't fail the approval if email/activation fails
    }

    return {
      success: true,
      message: 'Organization approved successfully',
      organization: {
        _id: organization._id,
        name: organization.name,
        status: organization.status,
        approvedAt: organization.approvedAt
      }
    }
  } catch (err: any) {
    console.error('[APPROVE-ORG] Error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to approve organization'
    })
  }
})
