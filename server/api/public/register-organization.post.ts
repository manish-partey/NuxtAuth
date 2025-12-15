// server/api/public/register-organization.post.ts
import { defineEventHandler, createError, readBody } from 'h3'
import User from '~/server/models/User'
import Organization from '~/server/models/Organization'
import Platform from '~/server/models/Platform'
import { sendEmail, emailTemplates } from '~/server/utils/email'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { 
      // User fields
      name,
      email,
      // Organization fields
      organizationName,
      organizationDescription,
      organizationType,
      platformId,
      // Additional admins
      additionalAdmins = []
    } = body

    // Validation
    if (!name || !email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name and email are required'
      })
    }

    if (!organizationName || !organizationType || !platformId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Organization name, type, and platform are required'
      })
    }

    // Validate ObjectId formats
    const mongoose = await import('mongoose')
    if (!mongoose.default.Types.ObjectId.isValid(platformId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid platform ID format'
      })
    }
    if (!mongoose.default.Types.ObjectId.isValid(organizationType)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid organization type ID format'
      })
    }

    // Validate additional admins
    if (additionalAdmins && additionalAdmins.length > 0) {
      for (const admin of additionalAdmins) {
        if (!admin.name || !admin.email) {
          throw createError({
            statusCode: 400,
            statusMessage: 'All additional admins must have name and email'
          })
        }
      }
      
      // Check for duplicate emails (including primary admin)
      const allEmails = [email, ...additionalAdmins.map((a: any) => a.email)].map((e: string) => e.toLowerCase())
      const uniqueEmails = new Set(allEmails)
      if (uniqueEmails.size !== allEmails.length) {
        throw createError({
          statusCode: 400,
          statusMessage: 'All email addresses must be unique'
        })
      }
    }

    // Check if this email + organization name combination already exists
    const existingOrgWithEmail = await Organization.findOne({
      name: { $regex: new RegExp(`^${organizationName}$`, 'i') },
      platformId
    })
    
    if (existingOrgWithEmail) {
      // Check if the user who created this org has the same email
      const orgCreator = await User.findById(existingOrgWithEmail.createdBy)
      if (orgCreator && orgCreator.email.toLowerCase() === email.toLowerCase()) {
        throw createError({
          statusCode: 400,
          statusMessage: 'You have already registered this organization. Please login instead.'
        })
      }
    }

    // Verify platform exists
    const platform = await Platform.findById(platformId)
    if (!platform) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Platform not found'
      })
    }

    // Verify organization type exists
    const OrganizationType = (await import('~/server/models/OrganizationType')).default
    const orgType = await OrganizationType.findById(organizationType)
    if (!orgType) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Organization type not found'
      })
    }

    // Check if organization name already exists in this platform (any status)
    const existingOrg = await Organization.findOne({
      name: { $regex: new RegExp(`^${organizationName}$`, 'i') }, // Case-insensitive match
      platformId
    })
    if (existingOrg) {
      const statusMessage = existingOrg.status === 'pending' 
        ? 'An organization with this name is already pending approval in this platform'
        : existingOrg.status === 'approved'
        ? 'Organization name already exists in this platform'
        : 'An organization with this name was previously registered in this platform'
      
      throw createError({
        statusCode: 400,
        statusMessage
      })
    }

    // Generate a random temporary password (will be hashed by User model pre-save hook)
    const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).toUpperCase().slice(-4)

    // Generate reset token for password setup (expires in 24 hours)
    const { v4: uuidv4 } = await import('uuid')
    const resetToken = uuidv4()
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Generate username from name (lowercase, no spaces, add random suffix for uniqueness)
    const username = name.toLowerCase().replace(/\s+/g, '') + Math.random().toString(36).slice(-4)

    console.log('[PUBLIC-ORG-REGISTER] Creating user with data:', {
      username,
      name,
      email: email.toLowerCase(),
      role: 'organization_admin',
      status: 'pending',
      platformId,
      hasResetToken: !!resetToken,
      organizationId: null
    })

    // Create user with organization_admin role
    // Note: User will be inactive until organization is approved
    let user
    try {
      user = await User.create({
        username, // Generated from name with random suffix
        name,
        email: email.toLowerCase(),
        password: randomPassword, // Will be hashed by pre-save hook
        role: 'organization_admin',
        status: 'pending', // User is pending until org is approved
        platformId,
        resetPasswordToken: resetToken,
        resetPasswordExpiry: resetTokenExpiry,
        organizationId: null, // Explicitly set to null, will be updated after org creation
      })
    } catch (userError: any) {
      console.error('[PUBLIC-ORG-REGISTER] User creation failed:', userError)
      console.error('[PUBLIC-ORG-REGISTER] Full error object:', JSON.stringify(userError, null, 2))
      throw createError({
        statusCode: 400,
        statusMessage: `User creation failed: ${userError.message || 'Unknown error'}`
      })
    }

    // Generate organization slug
    const slug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Create organization with pending status
    console.log('[PUBLIC-ORG-REGISTER] Creating organization with data:', {
      name: organizationName,
      description: organizationDescription || '',
      slug,
      type: organizationType,
      platformId,
      status: 'pending',
      createdBy: user._id
    })
    
    let organization
    try {
      organization = await Organization.create({
        name: organizationName,
        description: organizationDescription || '',
        slug,
        type: organizationType,
        platformId,
        status: 'pending',
        createdBy: user._id
      })
    } catch (orgError: any) {
      console.error('[PUBLIC-ORG-REGISTER] Organization creation failed:', orgError)
      console.error('[PUBLIC-ORG-REGISTER] Full org error object:', JSON.stringify(orgError, null, 2))
      throw createError({
        statusCode: 400,
        statusMessage: `Organization creation failed: ${orgError.message || 'Unknown error'}`
      })
    }

    // Update user with organizationId (use updateOne to skip pre-save hook)
    await User.updateOne(
      { _id: user._id },
      { $set: { organizationId: organization._id } }
    )

    console.log('[PUBLIC-ORG-REGISTER] Created organization:', {
      organizationId: organization._id,
      organizationName: organization.name,
      userId: user._id,
      userEmail: user.email,
      platformId,
      status: 'pending'
    })

    // Create additional admins if provided
    const createdAdmins = []
    if (additionalAdmins && additionalAdmins.length > 0) {
      const { v4: uuidv4 } = await import('uuid')
      
      for (const admin of additionalAdmins) {
        try {
          // Generate random password and reset token for each admin
          const adminPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).toUpperCase().slice(-4)
          const adminResetToken = uuidv4()
          const adminResetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
          const adminUsername = admin.name.toLowerCase().replace(/\s+/g, '') + Math.random().toString(36).slice(-4)

          const additionalUser = await User.create({
            username: adminUsername,
            name: admin.name,
            email: admin.email.toLowerCase(),
            password: adminPassword,
            role: 'organization_admin',
            status: 'pending',
            platformId,
            organizationId: organization._id,
            resetPasswordToken: adminResetToken,
            resetPasswordExpiry: adminResetTokenExpiry
          })

          createdAdmins.push({
            user: additionalUser,
            resetToken: adminResetToken
          })

          console.log('[PUBLIC-ORG-REGISTER] Created additional admin:', {
            userId: additionalUser._id,
            email: additionalUser.email,
            name: additionalUser.name
          })
        } catch (adminError: any) {
          console.error('[PUBLIC-ORG-REGISTER] Failed to create additional admin:', admin.email, adminError)
          // Continue with other admins even if one fails
        }
      }
    }

    // Send confirmation email with password reset link to registrant
    const config = useRuntimeConfig()
    const baseUrl = config.public.appUrl || config.public.baseUrl || 'http://localhost:3000'
    
    // Send email to primary admin
    try {
      const resetLink = `${baseUrl}/reset-password?token=${resetToken}`
      
      await sendEmail({
        to: user.email,
        subject: `Set Your Password - ${organization.name} Registration`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
            <h2 style="color: #3b82f6;">Welcome to ${platform.name}!</h2>
            <p>Dear ${user.name},</p>
            <p>Your organization registration has been received:</p>
            <ul>
              <li><strong>Organization:</strong> ${organization.name}</li>
              <li><strong>Platform:</strong> ${platform.name}</li>
              <li><strong>Role:</strong> Organization Admin</li>
            </ul>
            <p><strong>Status:</strong> Pending Approval</p>
            <p>Your organization is currently under review by the platform administrator.</p>
            <p><strong>Important:</strong> Please set your password by clicking the button below:</p>
            <p style="margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Set Your Password</a>
            </p>
            <p><strong>Note:</strong> This link will expire in 24 hours.</p>
            <p>Once your organization is approved, you will receive another email and can log in with your new password.</p>
            <p>Thank you for your patience!</p>
            <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #777;">Best regards,<br>${platform.name} Team</p>
          </div>
        `,
        text: `Welcome to ${platform.name}!\n\nYour organization registration has been received:\n\nOrganization: ${organization.name}\nPlatform: ${platform.name}\nRole: Organization Admin\nStatus: Pending Approval\n\nPlease set your password by visiting: ${resetLink}\n\nThis link will expire in 24 hours.\n\nYou will receive another email once your organization is approved.\n\nThank you for your patience!`
      })
      console.log('[PUBLIC-ORG-REGISTER] Confirmation email with password reset link sent to:', user.email)
    } catch (emailError) {
      console.error('[PUBLIC-ORG-REGISTER] Failed to send confirmation email:', emailError)
      // Continue even if email fails
    }

    // Send emails to additional admins
    for (const admin of createdAdmins) {
      try {
        const adminResetLink = `${baseUrl}/reset-password?token=${admin.resetToken}`
        
        await sendEmail({
          to: admin.user.email,
          subject: `Set Your Password - ${organization.name} Registration`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
              <h2 style="color: #3b82f6;">Welcome to ${platform.name}!</h2>
              <p>Dear ${admin.user.name},</p>
              <p>You have been added as an Organization Admin for:</p>
              <ul>
                <li><strong>Organization:</strong> ${organization.name}</li>
                <li><strong>Platform:</strong> ${platform.name}</li>
                <li><strong>Role:</strong> Organization Admin</li>
              </ul>
              <p><strong>Status:</strong> Pending Approval</p>
              <p>The organization is currently under review by the platform administrator.</p>
              <p><strong>Important:</strong> Please set your password by clicking the button below:</p>
              <p style="margin: 30px 0;">
                <a href="${adminResetLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Set Your Password</a>
              </p>
              <p><strong>Note:</strong> This link will expire in 24 hours.</p>
              <p>Once the organization is approved, you will receive another email and can log in with your new password.</p>
              <p>Thank you for your patience!</p>
              <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #777;">Best regards,<br>${platform.name} Team</p>
            </div>
          `,
          text: `Welcome to ${platform.name}!\n\nYou have been added as an Organization Admin for:\n\nOrganization: ${organization.name}\nPlatform: ${platform.name}\nRole: Organization Admin\nStatus: Pending Approval\n\nPlease set your password by visiting: ${adminResetLink}\n\nThis link will expire in 24 hours.\n\nYou will receive another email once the organization is approved.\n\nThank you for your patience!`
        })
        console.log('[PUBLIC-ORG-REGISTER] Confirmation email sent to additional admin:', admin.user.email)
      } catch (emailError) {
        console.error('[PUBLIC-ORG-REGISTER] Failed to send email to additional admin:', admin.user.email, emailError)
        // Continue even if email fails
      }
    }

    // Send notification email to platform admins for approval
    try {
      const platformAdmins = await User.find({
        platformId,
        role: 'platform_admin',
        status: 'active'
      })

      console.log('[PUBLIC-ORG-REGISTER] Searching for platform admins with platformId:', platformId)
      console.log('[PUBLIC-ORG-REGISTER] Found platform admins:', platformAdmins.length)
      
      if (platformAdmins.length > 0) {
        console.log('[PUBLIC-ORG-REGISTER] Platform admin emails:', platformAdmins.map(admin => admin.email).join(', '))
      } else {
        console.warn('[PUBLIC-ORG-REGISTER] No active platform admins found for platformId:', platformId)
      }

      for (const platformAdmin of platformAdmins) {
        try {
          const approvalLink = `${baseUrl}/platform/organizations`
          
          console.log('[PUBLIC-ORG-REGISTER] Attempting to send approval email to:', platformAdmin.email)
          
          const emailResult = await sendEmail({
            to: platformAdmin.email,
            subject: `New Organization Registration - ${organizationName}`,
            html: `
              <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                <h2 style="color: #3b82f6;">New Organization Registration Pending</h2>
                <p>Dear ${platformAdmin.name},</p>
                <p>A new organization has registered on ${platform.name} and requires your approval:</p>
                <ul>
                  <li><strong>Organization Name:</strong> ${organizationName}</li>
                  <li><strong>Description:</strong> ${organizationDescription || 'Not provided'}</li>
                  <li><strong>Primary Admin:</strong> ${name} (${email})</li>
                  <li><strong>Additional Admins:</strong> ${createdAdmins.length}</li>
                  <li><strong>Platform:</strong> ${platform.name}</li>
                </ul>
                <p style="margin: 30px 0;">
                  <a href="${approvalLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Review Organization</a>
                </p>
                <p>Please review and approve or reject this organization registration from your platform admin dashboard.</p>
                <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #777;">This is an automated notification from ${platform.name}</p>
              </div>
            `,
            text: `New Organization Registration Pending\n\nDear ${platformAdmin.name},\n\nA new organization has registered on ${platform.name} and requires your approval:\n\nOrganization Name: ${organizationName}\nDescription: ${organizationDescription || 'Not provided'}\nPrimary Admin: ${name} (${email})\nAdditional Admins: ${createdAdmins.length}\nPlatform: ${platform.name}\n\nPlease review and approve or reject this organization from your dashboard: ${approvalLink}\n\nThank you!`
          })
          
          console.log('[PUBLIC-ORG-REGISTER] ✓ Approval notification successfully sent to platform admin:', platformAdmin.email)
          console.log('[PUBLIC-ORG-REGISTER] Email send result:', emailResult)
        } catch (adminEmailError: any) {
          console.error('[PUBLIC-ORG-REGISTER] ✗ Failed to send email to platform admin:', platformAdmin.email)
          console.error('[PUBLIC-ORG-REGISTER] Email error details:', {
            message: adminEmailError.message,
            stack: adminEmailError.stack,
            code: adminEmailError.code
          })
          // Continue even if email to one admin fails
        }
      }
    } catch (platformAdminError) {
      console.error('[PUBLIC-ORG-REGISTER] Failed to fetch/notify platform admins:', platformAdminError)
      // Continue even if platform admin notification fails
    }

    const totalAdmins = 1 + createdAdmins.length
    const adminText = totalAdmins > 1 ? `${totalAdmins} organization admins have` : 'Your organization admin account has'
    
    return {
      success: true,
      message: `Registration successful! ${adminText} been created and will be activated once the organization is approved. Password reset emails have been sent to all admins.`,
      organization: {
        id: organization._id,
        name: organization.name,
        status: organization.status
      },
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      additionalAdminsCreated: createdAdmins.length
    }
  } catch (err: any) {
    console.error('[PUBLIC-ORG-REGISTER] Error:', err)
    console.error('[PUBLIC-ORG-REGISTER] Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      errors: err.errors
    })
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Failed to register organization'
    })
  }
})
