// server/services/organization.ts
import Organization from '~/server/models/Organization';
import Platform from '~/server/models/Platform';
import User from '~/server/models/User';
import { registerUser } from './user';
import { hasPermission, validateRequired } from './utils';
import { sendEmail } from '~/server/utils/mail';

interface CreateOrganizationInput {
  platformId: string;
  name: string;
  type: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
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
    throw new Error('Organization with this name already exists under this platform3');
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

  // Register admin user
  const adminUser = await registerUser({
    username: adminEmail.split('@')[0],
    email: adminEmail,
    
    role: 'organization_admin',
    platformId,
    isVerified: false
  });

  // Update organization with admin reference
  newOrg.createdBy = adminUser._id;
  await newOrg.save();

  // Send notification emails
  await sendOrganizationNotifications(newOrg, platform, adminUser, adminName);

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
  adminName: string
) {
  try {
    const config = useRuntimeConfig();
    const approvalLink = `${config.public.appUrl}/approve-organization?orgId=${organization._id}`;

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
        `New organization ${organization.name} registered and needs approval: ${approvalLink}`
      );
    }

    // Send confirmation to organization admin
    await sendEmail(
      adminUser.email,
      `Registration Confirmed - ${organization.name}`,
      `Your organization ${organization.name} has been submitted for approval on platform ${platform.name}.`
    );

  } catch (emailError) {
    console.error('Failed to send notification emails:', emailError);
    // Don't throw - continue with registration even if emails fail
  }
}
