import { defineEventHandler, createError, readBody } from 'h3'
import { getUserFromEvent } from '~/server/utils/auth'
import { createUserForOrg } from '~/server/services/user'
import Organization from '~/server/models/Organization'
import { sendEmail } from '~/server/utils/mail'

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user (org admin)
    const currentUser = await getUserFromEvent(event)
    if (!currentUser) {
      throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
    }

    // Verify user is organization admin
    if (currentUser.role !== 'organization_admin') {
      throw createError({ statusCode: 403, statusMessage: 'Only organization administrators can create users' })
    }

    const body = await readBody(event)
    const { name, email, role = 'user' } = body

    // Validate inputs
    if (!name || !email) {
      throw createError({ statusCode: 400, statusMessage: 'Name and email are required' })
    }

    // Validate role (org admins can only create regular users)
    const allowedRoles = ['user', 'manager', 'employee']
    if (!allowedRoles.includes(role)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid role. Organization admins can only create: user, manager, employee' })
    }

    // Get user's organization
    const organizationId = currentUser.organizationId
    if (!organizationId) {
      throw createError({ statusCode: 403, statusMessage: 'No organization associated with your account' })
    }

    // Get organization details for email
    const organization = await Organization.findById(organizationId)
    if (!organization) {
      throw createError({ statusCode: 404, statusMessage: 'Organization not found' })
    }

    // Create user with reset token
    const result = await createUserForOrg({
      name,
      email,
      role,
      organizationId,
      platformId: currentUser.platformId,
      organizationName: organization.name,
      createdByName: currentUser.name
    })

    // Send password setup email
    const config = useRuntimeConfig()
    const resetUrl = `${config.public.appUrl || 'http://localhost:3000'}/reset-password?token=${result.resetPasswordToken}`
    
    const emailSubject = `Welcome to ${organization.name} - Set Your Password`
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; 
                 text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 20px; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Welcome to ${organization.name}!</h1>
    </div>
    <div class="content">
        <p>Hello ${name},</p>
        <p><strong>${currentUser.name}</strong> has created an account for you at <strong>${organization.name}</strong> with the role of <strong>${role}</strong>.</p>
        
        <p>To complete your account setup and set your password, click the button below:</p>
        
        <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Set Your Password</a>
        </p>
        
        <p>Or copy and paste this link into your browser:<br>
        <code style="background-color: #f1f5f9; padding: 5px;">${resetUrl}</code></p>
        
        <p><strong>⚠️ Important:</strong> This link will expire in 24 hours for security reasons.</p>
        
        <p><strong>Your login email:</strong> ${email}</p>
        
        <div class="footer">
            <p>Best regards,<br>
            ${currentUser.name}<br>
            <em>${organization.name}</em></p>
            <p><small>If you have any questions, please contact your administrator.</small></p>
        </div>
    </div>
</body>
</html>
    `.trim()

    // Send email
    try {
      await sendEmail(email, emailSubject, emailContent)
      console.log(`[org/users/create] Password setup email sent to ${email}`)
    } catch (emailError) {
      console.error('Failed to send password setup email:', emailError)
      // Don't fail the user creation if email fails, just log it
    }

    return {
      success: true,
      message: `User ${name} created successfully. A password setup email has been sent to ${email}.`,
      user: result.user
    }

  } catch (error: any) {
    console.error('[org/users/create.post] Error:', error)
    throw error.statusCode ? error : createError({
      statusCode: 500,
      statusMessage: 'Failed to create user',
      data: error.message
    })
  }
})