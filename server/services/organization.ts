// server/services/organization.ts
import Organization from '~/server/models/Organization';
import Platform from '~/server/models/Platform';
import User from '~/server/models/User';
import { hasPermission, validateRequired } from './utils';
import { sendEmail } from '~/server/utils/mail';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

interface CreateOrganizationInput {
  platformId: string;
  name: string;
  type: string;
  adminName: string;
  adminEmail: string;
 }

/**
 * Create organization with admin user - simplified
 */
export async function createOrganization(data: CreateOrganizationInput) {
  const { platformId, name, type, adminName, adminEmail } = data;

  validateRequired(data, ['platformId', 'name', 'type', 'adminName', 'adminEmail']);

  // Verify platform exists
  const platform = await Platform.findById(platformId);
  if (!platform) {
    throw new Error('Platform not found');
  }

  // Check for duplicate organization name under platform
  const existingOrg = await Organization.findOne({ 
    name,
    platformId 
  });
  
  if (existingOrg) {
    throw new Error('Organization with this name already exists under this platform4');
  }

  // Create unique slug
  let baseSlug = name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  let slug = baseSlug;
  let counter = 1;
  
  while (await Organization.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Create organization with pending status
  const newOrg = new Organization({
    name,
    type,
    slug,
    status: 'pending',
    platformId,
    createdBy: null
  });

  // Check if admin user already exists
  const existingUser = await User.findOne({ email: adminEmail });
  if (existingUser) {
    throw new Error('Email already registered. Please use a different email address.');
  }

  // Create admin user with reset token for password setting
  const resetPasswordToken = crypto.randomBytes(32).toString('hex');
  const resetPasswordExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  // Create temporary password and hash it
  const tempPassword = 'temp_' + crypto.randomBytes(16).toString('hex');
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const adminUser = new User({
    username: adminEmail.split('@')[0] + '_' + Date.now(),
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
    role: 'organization_admin',
    platformId,
    resetPasswordToken,
    resetPasswordExpiry,
    isVerified: false // User must verify via password reset
  });

  await adminUser.save();

  // Update organization with admin reference
  newOrg.createdBy = adminUser._id;
  await newOrg.save();

  // Send notification emails
  await sendOrganizationNotifications(newOrg, platform, adminUser, adminName, resetPasswordToken);

  return {
    organization: newOrg,
    adminUser,
    platform
  };
}

/**
 * Approve or reject organization - simplified
 */
export async function processOrganizationApproval(
  organizationId: string,
  action: 'approve' | 'reject',
  approverUserId: string,
  rejectionReason?: string
) {
  validateRequired({ organizationId, action, approverUserId }, ['organizationId', 'action', 'approverUserId']);

  // Find organization with populated fields
  const organization = await Organization.findById(organizationId)
    .populate('createdBy')
    .populate('platformId');

  if (!organization) {
    throw new Error('Organization not found');
  }

  if (organization.status !== 'pending') {
    throw new Error(`Organization is already ${organization.status}`);
  }

  // Check permissions - only platform admins of the same platform can approve
  const canApprove = await hasPermission(
    approverUserId, 
    'platform_admin', 
    organization.platformId._id.toString()
  );

  if (!canApprove) {
    throw new Error('Only platform admins can approve organizations');
  }

  if (action === 'approve') {
    // Approve organization
    organization.status = 'approved';
    await organization.save();

    // Update admin user
    const adminUser = await User.findById(organization.createdBy._id);
    if (adminUser) {
      adminUser.organizationId = organization._id;
      await adminUser.save();

      // Send approval email
      const config = useRuntimeConfig();
      const verificationLink = `${config.public.appUrl}/verify-email?token=${adminUser.verificationToken}`;
      
      await sendEmail(
        adminUser.email,
        `🎉 Organization Approved - ${organization.name}`,
        `Organization ${organization.name} has been approved! Please verify your email at: ${verificationLink}`
      );
    }

    return { success: true, message: 'Organization approved successfully' };

  } else if (action === 'reject') {
    if (!rejectionReason) {
      throw new Error('Rejection reason is required');
    }

    organization.status = 'rejected';
    await organization.save();

    // Send rejection email
    const adminUser = organization.createdBy;
    await sendEmail(
      adminUser.email,
      `Organization Registration Rejected - ${organization.name}`,
      `Organization registration for ${organization.name} was rejected. Reason: ${rejectionReason}`
    );

    return { success: true, message: 'Organization rejected successfully' };
  }

  throw new Error('Invalid action specified');
}

/**
 * Send notification emails for new organization registration
 */
async function sendOrganizationNotifications(
  organization: any, 
  platform: any, 
  adminUser: any, 
  adminName: string,
  resetPasswordToken: string
) {
  try {
    const config = useRuntimeConfig();
    const approvalLink = `${config.public.appUrl}/approve-organization?orgId=${organization._id}`;
    const setPasswordLink = `${config.public.appUrl}/reset-password?token=${resetPasswordToken}`;

    // Get platform admins and creator
    const platformAdmins = await User.find({ 
      platformId: platform._id, 
      role: 'platform_admin',
      isVerified: true 
    });

    let platformCreator = null;
    if (platform.createdBy) {
      platformCreator = await User.findById(platform.createdBy);
    }

    const recipients = [...platformAdmins];
    if (platformCreator && !platformAdmins.some((admin: any) => admin._id.equals(platformCreator._id))) {
      recipients.push(platformCreator);
    }

    // Send approval notifications to platform team
    for (const recipient of recipients) {
      await sendEmail(
        recipient.email,
        `New Organization Registration - ${organization.name}`,
        `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; 
                 text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .details { background-color: #e0f2fe; padding: 15px; border-radius: 6px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>New Organization Registration</h1>
    </div>
    <div class="content">
        <p>Hello ${recipient.name},</p>
        <p>A new organization has registered on your platform and requires approval:</p>
        
        <div class="details">
            <p><strong>Organization:</strong> ${organization.name}</p>
            <p><strong>Type:</strong> ${organization.type}</p>
            <p><strong>Platform:</strong> ${platform.name}</p>
            <p><strong>Admin Name:</strong> ${adminName}</p>
            <p><strong>Admin Email:</strong> ${adminUser.email}</p>
        </div>
        
        <p style="text-align: center;">
            <a href="${approvalLink}" class="button">Review & Approve</a>
        </p>
        
        <p>Please review and approve or reject this organization registration.</p>
    </div>
</body>
</html>
        `
      );
    }

    // Send confirmation to organization admin with password setup link
    await sendEmail(
      adminUser.email,
      `Welcome to ${platform.name} - Set Your Password`,
      `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; 
                 text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .warning { background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #f59e0b; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Registration Confirmed!</h1>
        <p>Welcome to ${platform.name}</p>
    </div>
    <div class="content">
        <p>Hello ${adminName},</p>
        <p>You have asked to join <strong>${organization.name}</strong> on ${platform.name}!</p>
        
              
        <p>please set up your password by clicking the link below:</p>
        
        <p style="text-align: center;">
            <a href="${setPasswordLink}" class="button">Set Your Password</a>
        </p>
        
        <div class="warning">
            <p><strong>⚠️ Important:</strong> This link will expire in 24 hours for security reasons.</p>
        </div>
        
        <p><strong>What happens next:</strong></p>
        <ol>
            <li>Set your password using the link above</li>
            <li>Wait for platform administrator approval</li>
            <li>Once approved, you'll receive an email notification</li>
            <li>You can then log in and start managing your organization</li>
        </ol>
        
        <p>If you have any questions, please contact the platform support team.</p>
        
        <p>Best regards,<br>
        The ${platform.name} Team</p>
    </div>
</body>
</html>
      `
    );

  } catch (emailError) {
    console.error('Failed to send notification emails:', emailError);
    // Don't throw - continue with registration even if emails fail
  }
}
