// server/api/platform/organization/register.post.ts
import { defineEventHandler, readBody, createError } from 'h3';
import { connectToDatabase } from '~/server/utils/db';
import { requireRole } from '~/server/utils/auth';
import OrganizationType from '~/server/models/OrganizationType';
import Platform from '~/server/models/Platform';
import Organization from '~/server/models/Organization';
import User from '~/server/models/User';
import { sendEmail } from '~/server/utils/email';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();
    
    // Require platform_admin authentication
    const platformAdmin = await requireRole(event, ['platform_admin']);
    
    const body = await readBody(event);
    const { 
      platformId, 
      organizationName,
      organizationDescription,
      organizationType: organizationTypeId,
      name: adminName, 
      email: adminEmail,
      additionalAdmins = [],
      trustLevel = 'low' // 'high' for trusted partners, 'low' for new orgs requiring verification
    } = body;

    // Validate required fields
    if (!platformId || !organizationName || !organizationTypeId || !adminName || !adminEmail) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'All fields are required' 
      });
    }
    
    // Validate platform admin has access to this platform
    if (platformAdmin.platformId?.toString() !== platformId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only create organizations for your assigned platform'
      });
    }

    // Validate platform exists
    const platform = await Platform.findById(platformId);
    if (!platform) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Platform not found'
      });
    }

    // Validate organization type exists and is active
    const orgType = await OrganizationType.findById(organizationTypeId);
    if (!orgType) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Organization type not found'
      });
    }

    if (orgType.status !== 'active') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Selected organization type is not available'
      });
    }

    // Check if org type is allowed for this platform
    if (platform.allowedOrganizationTypes && platform.allowedOrganizationTypes.length > 0) {
      const isAllowed = platform.allowedOrganizationTypes.some(
        (typeId: any) => typeId.toString() === organizationTypeId
      );
      
      if (!isAllowed) {
        throw createError({
          statusCode: 400,
          statusMessage: `Organization type "${orgType.name}" is not allowed for platform "${platform.name}"`
        });
      }
    }

    // Check for duplicate organization name
    const existingOrg = await Organization.findOne({ name: organizationName, platformId });
    if (existingOrg) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Organization with this name already exists under this platform'
      });
    }
    
    // Generate unique slug
    let slug = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let counter = 1;
    while (await Organization.findOne({ slug })) {
      slug = `${organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${counter}`;
      counter++;
    }
    
    // Determine organization status based on trust level
    const orgStatus = trustLevel === 'high' ? 'approved' : 'pending_documents';
    
    // Create organization
    const organization = new Organization({
      name: organizationName,
      description: organizationDescription || '',
      type: organizationTypeId,
      slug,
      status: orgStatus,
      platformId,
      createdBy: platformAdmin.id
    });
    
    await organization.save();
    
    // Helper function to create admin user
    const createAdminUser = async (name: string, email: string) => {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error(`Email ${email} is already registered`);
      }
      
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      // Create temporary password
      const tempPassword = 'temp_' + crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      
      const user = new User({
        username: email.split('@')[0] + '_' + Date.now(),
        name,
        email,
        password: hashedPassword,
        role: 'organization_admin',
        platformId,
        organizationId: organization._id,
        resetPasswordToken: resetToken,
        resetPasswordExpiry: resetTokenExpiry,
        status: orgStatus === 'approved' ? 'active' : 'inactive',
        isVerified: false
      });
      
      await user.save();
      return { user, resetToken };
    };
    
    // Create primary admin
    const { user: primaryAdmin, resetToken: primaryResetToken } = await createAdminUser(adminName, adminEmail);
    
    // Create additional admins
    const additionalAdminDetails: Array<{ user: any; resetToken: string }> = [];
    for (const admin of additionalAdmins) {
      if (admin.name && admin.email) {
        try {
          const { user, resetToken } = await createAdminUser(admin.name, admin.email);
          additionalAdminDetails.push({ user, resetToken });
        } catch (err: any) {
          console.error('[PLATFORM-ORG-REGISTER] Failed to create additional admin:', admin.email, err.message);
        }
      }
    }
    
    // Update organization with creator reference
    organization.createdBy = primaryAdmin._id;
    await organization.save();
    
    // Increment usage count for the org type
    await OrganizationType.findByIdAndUpdate(organizationTypeId, {
      $inc: { usageCount: 1 }
    });
    
    // Send emails to all admins
    const config = useRuntimeConfig();
    const baseUrl = config.public.appUrl;
    
    // Send email to primary admin
    const primaryResetLink = `${baseUrl}/reset-password?token=${primaryResetToken}`;
    await sendEmail({
      to: adminEmail,
      subject: `Welcome to ${platform.name} - Set Your Password`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .info { background-color: ${orgStatus === 'approved' ? '#d1fae5' : '#fef3c7'}; padding: 15px; border-radius: 6px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 Organization Created!</h1>
  </div>
  <div class="content">
    <p>Hello ${adminName},</p>
    <p>Your organization <strong>${organizationName}</strong> has been created on ${platform.name} by a platform administrator.</p>
    
    <div class="info">
      <p><strong>Organization:</strong> ${organizationName}</p>
      <p><strong>Platform:</strong> ${platform.name}</p>
      <p><strong>Your Role:</strong> Organization Admin</p>
      <p><strong>Status:</strong> ${orgStatus === 'approved' ? '✅ Approved - Active' : '⏳ Pending Documents'}</p>
    </div>
    
    <p><strong>First Step:</strong> Set up your password by clicking the button below:</p>
    
    <p style="text-align: center;">
      <a href="${primaryResetLink}" class="button">Set Your Password</a>
    </p>
    
    ${orgStatus === 'pending_documents' ? '<p><strong>⚠️ Important:</strong> After setting your password, please upload the required documents to activate your organization.</p>' : '<p><strong>✅ Your organization is active!</strong> You can log in and start managing your organization immediately.</p>'}
    
    <p style="color: #666; font-size: 12px;">This link will expire in 24 hours.</p>
  </div>
</body>
</html>
      `,
      text: `Welcome to ${platform.name}!\n\nYour organization ${organizationName} has been created.\n\nSet your password: ${primaryResetLink}\n\nStatus: ${orgStatus}\n\nThis link expires in 24 hours.`
    });
    
    // Send emails to additional admins
    for (const adminDetail of additionalAdminDetails) {
      const adminResetLink = `${baseUrl}/reset-password?token=${adminDetail.resetToken}`;
      await sendEmail({
        to: adminDetail.user.email,
        subject: `Welcome to ${platform.name} - Set Your Password`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 You've Been Added as Admin!</h1>
  </div>
  <div class="content">
    <p>Hello ${adminDetail.user.name},</p>
    <p>You have been added as an Organization Admin for <strong>${organizationName}</strong> on ${platform.name}.</p>
    <p style="text-align: center;">
      <a href="${adminResetLink}" class="button">Set Your Password</a>
    </p>
  </div>
</body>
</html>
        `,
        text: `Welcome! You've been added as admin for ${organizationName}.\n\nSet your password: ${adminResetLink}`
      });
    }
    
    // If pending documents, notify platform admins
    if (orgStatus === 'pending_documents') {
      const platformAdmins = await User.find({ 
        platformId, 
        role: 'platform_admin',
        status: 'active'
      });
      
      for (const admin of platformAdmins) {
        if (admin._id.toString() !== platformAdmin.id) {
          await sendEmail({
            to: admin.email,
            subject: `New Organization Requires Document Verification - ${organizationName}`,
            html: `<p>Hi ${admin.name},</p><p>A new organization <strong>${organizationName}</strong> has been created and requires document verification before activation.</p><p>Organization admin: ${adminName} (${adminEmail})</p>`,
            text: `New organization ${organizationName} requires document verification.`
          });
        }
      }
    }
    
    const adminCount = 1 + additionalAdminDetails.length;
    const adminText = adminCount === 1 ? 'Admin account has' : `${adminCount} admin accounts have`;
    
    return { 
      success: true,
      message: orgStatus === 'approved' 
        ? `🎉 Organization "${organizationName}" created and activated successfully! ${adminText} been created and password reset emails have been sent.`
        : `🎉 Organization "${organizationName}" created! ${adminText} been created and password reset emails have been sent. Organization will be fully active after document verification.`,
      organizationId: organization._id,
      status: orgStatus,
      details: {
        organizationName,
        platform: platform.name,
        status: orgStatus,
        adminCount,
        requiresDocuments: orgStatus === 'pending_documents'
      }
    };

  } catch (err: any) {
    console.error('[API] Platform organization register error:', err);
    
    // Handle specific MongoDB duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      let message = 'This organization already exists';
      
     
      if (field === 'name') {
        message = 'Organization with this name already exists under this platform2';
      } else if (field === 'email') {
        message = 'This email is already registered';
      }
      
      throw createError({
        statusCode: 409,
        statusMessage: message,
      });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      throw createError({
        statusCode: 400,
        statusMessage: err.message,
      });
    }

    // If it's already a createError, re-throw it
    if (err.statusCode) {
      throw err;
    }
    
    // Generic server error
    throw createError({
      statusCode: 500,
      statusMessage: 'Organization registration failed. Please try again.',
    });
  }
});
