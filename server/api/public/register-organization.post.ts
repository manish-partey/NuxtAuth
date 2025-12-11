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
      platformId
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

    // Send confirmation email with password reset link to registrant
    try {
      const config = useRuntimeConfig()
      const baseUrl = config.public.appUrl || config.public.baseUrl || 'http://localhost:3000'
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
        text: `Welcome to ${platform.name}!\n\nYour organization registration has been received:\n\nOrganization: ${organization.name}\nPlatform: ${platform.name}\nStatus: Pending Approval\n\nPlease set your password by visiting: ${resetLink}\n\nThis link will expire in 24 hours.\n\nYou will receive another email once your organization is approved.\n\nThank you for your patience!`
      })
      console.log('[PUBLIC-ORG-REGISTER] Confirmation email with password reset link sent to:', user.email)
    } catch (emailError) {
      console.error('[PUBLIC-ORG-REGISTER] Failed to send confirmation email:', emailError)
      // Continue even if email fails
    }

    // NOTE: Platform admins will see pending organizations in their dashboard
    // No email notification sent to avoid inbox overload
    console.log('[PUBLIC-ORG-REGISTER] Organization pending approval - visible in platform admin dashboard')

    return {
      success: true,
      message: 'Registration successful! Your organization is pending approval. You will receive an email once approved.',
      organization: {
        id: organization._id,
        name: organization.name,
        status: organization.status
      },
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
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
