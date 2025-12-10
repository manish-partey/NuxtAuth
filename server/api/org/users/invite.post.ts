import { defineEventHandler, createError, readBody } from 'h3'
import { getUserFromEvent } from '~/server/utils/auth'
import User from '~/server/models/User'
import Organization from '~/server/models/Organization'
import { sendEmail } from '~/server/utils/mail'
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const currentUser = await getUserFromEvent(event)
    if (!currentUser) {
      throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
    }

    const body = await readBody(event)
    const { emails, role = 'user', customMessage } = body

    // Validate inputs
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'At least one email is required' })
    }

    if (emails.length > 50) {
      throw createError({ statusCode: 400, statusMessage: 'Maximum 50 invitations allowed at once' })
    }

    // Validate role
    const validRoles = ['organization_admin', 'manager', 'employee', 'guest']
    if (!validRoles.includes(role)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid role specified' })
    }

    // Get user's organization
    const organizationId = currentUser.organizationId
    if (!organizationId) {
      throw createError({ statusCode: 403, statusMessage: 'No organization associated with your account' })
    }

    // Get organization details
    const organization = await Organization.findById(organizationId)
    if (!organization) {
      throw createError({ statusCode: 404, statusMessage: 'Organization not found' })
    }

    console.log(`[invite.post] Processing ${emails.length} invitations for organization ${organization.name}`)

    const config = useRuntimeConfig()
    const results: { successful: string[], failed: { email: string, reason: string }[] } = { successful: [], failed: [] }

    // Process each email
    for (const email of emails) {
      try {
        // Check if user already exists
        let user = await User.findOne({ email, organizationId });
        if (!user) {
          // Create new user with isVerified=false and reset token
          const resetPasswordToken = uuidv4();
          const resetPasswordExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
          
          // Generate unique username to avoid conflicts
          const baseUsername = email.split('@')[0];
          const uniqueUsername = `${baseUsername}_${Date.now()}`;
          
          user = new User({
            email,
            name: email.split('@')[0], // Use email prefix as temporary name
            username: uniqueUsername,
            password: uuidv4(), // Temporary random password
            role,
            organizationId,
            platformId: currentUser.platformId,
            isVerified: false,
            status: 'invitation_sent',
            resetPasswordToken,
            resetPasswordExpiry
          });
          
          console.log(`[invite.post] Creating new user: ${email} with username: ${uniqueUsername}`);
          await user.save();
          console.log(`[invite.post] User created successfully: ${email}`);
        } else {
          console.log(`[invite.post] User already exists: ${email}, updating reset token`);
          // If user exists, update reset token and expiry
          user.resetPasswordToken = uuidv4();
          user.resetPasswordExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
          user.isVerified = false;
          user.status = 'invitation_sent';
          await user.save();
        }
        // Prepare reset link
        const resetUrl = `${config.public.appUrl}/reset-password?token=${user.resetPasswordToken}`;
        const emailSubject = `Invitation to join ${organization.name}`;
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
        .custom-message { background-color: #e0f2fe; padding: 15px; border-radius: 6px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>You're Invited!</h1>
        <p>Join ${organization.name}</p>
    </div>
    <div class="content">
        <p>Hello,</p>
        <p><strong>Organization Admin</strong> has invited you to join <strong>${organization.name}</strong> as a <strong>${role}</strong>.</p>
        
        ${customMessage ? `<div class="custom-message"><strong>Personal Message:</strong><br>${customMessage}</div>` : ''}
        
        <p>To join the organization and set your password, click the button below:</p>
        
        <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Set Password & Join</a>
        </p>
        
        <p>Or copy and paste this link into your browser:<br>
        <code style="background-color: #f1f5f9; padding: 5px;">${resetUrl}</code></p>
        
        <div class="footer">
            <p>Best regards,<br>
            ${currentUser.name}<br>
            <em>${organization.name}</em></p>
        </div>
    </div>
</body>
</html>
        `.trim();

        // Send invitation email
       
        await sendEmail(email, emailSubject, emailContent);
         console.log(email)
        console.log(emailSubject)
        results.successful.push(email);
      } catch (error: any) {
        console.error(`[invite.post] Failed to invite ${email}:`, error);
        console.error(`[invite.post] Error details:`, error.message);
        results.failed.push({ 
          email, 
          reason: error.message || 'Failed to send invitation' 
        });
      }
    }

    // Return results
    const totalSuccessful = results.successful.length
    const totalFailed = results.failed.length

    let message = ''
    if (totalSuccessful > 0 && totalFailed === 0) {
      message = `All ${totalSuccessful} invitations sent successfully`
    } else if (totalSuccessful > 0 && totalFailed > 0) {
      message = `${totalSuccessful} invitations sent, ${totalFailed} failed`
    } else {
      message = `All ${totalFailed} invitations failed`
    }

    return {
      success: totalSuccessful > 0,
      message,
      results
    }

  } catch (error: any) {
    console.error('[org/users/invite.post] Error:', error)
    throw error.statusCode ? error : createError({
      statusCode: 500,
      statusMessage: 'Failed to send invitations',
      data: error.message
    })
  }
})