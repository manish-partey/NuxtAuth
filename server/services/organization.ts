// server/services/organization.ts
import Organization from '~/server/models/Organization';
import User from '~/server/models/User';
import crypto from 'crypto';

interface CreateOrganizationInput {
  name: string;
  platformId: string;
  createdByUserId: string;
}

interface InviteOrganizationUserInput {
  organizationId: string;
  inviterUserId: string; // who is inviting
  email: string;
  name: string;
  role: 'org_admin' | 'user';
}

/**
 * Create a new organization under a platform
 */
export async function createOrganization(data: CreateOrganizationInput) {
  const { name, platformId, createdByUserId } = data;

  if (!name || !platformId) {
    throw new Error('Organization name and platformId are required');
  }

  // Check if creator has permission (super_admin or platform_admin of platform)
  const creator = await User.findById(createdByUserId).select('role platformId').exec();
  if (
    !creator ||
    !(
      creator.role === 'super_admin' ||
      (creator.role === 'platform_admin' && creator.platformId?.toString() === platformId)
    )
  ) {
    throw new Error('Permission denied to create organization');
  }

  // Check duplicate org name under same platform
  const existingOrg = await Organization.findOne({ name, platformId }).exec();
  if (existingOrg) {
    throw new Error('Organization with this name already exists in the platform');
  }

  const newOrg = new Organization({
    name,
    platformId,
  });

  await newOrg.save();
  return newOrg;
}

/**
 * Invite a user to organization - create user record with invite token
 * Role decides if org admin or normal user
 */
export async function inviteOrganizationUser(data: InviteOrganizationUserInput) {
  const { organizationId, inviterUserId, email, name, role } = data;

  if (!organizationId || !email || !name || !role) {
    throw new Error('All invite details are required');
  }

  if (!['org_admin', 'user'].includes(role)) {
    throw new Error('Invalid role for organization invite');
  }

  // Fetch inviter with relevant fields to check permission
  const inviter = await User.findById(inviterUserId).select('role platformId organizationId').exec();
  const orgPlatformId = await getOrganizationPlatformId(organizationId);

  if (
    !inviter ||
    !(
      inviter.role === 'super_admin' ||
      (inviter.role === 'platform_admin' && inviter.platformId?.toString() === orgPlatformId) ||
      (inviter.role === 'org_admin' && inviter.organizationId?.toString() === organizationId)
    )
  ) {
    throw new Error('Permission denied to invite user to organization');
  }

  // Check if user already invited or exists
  const existingUser = await User.findOne({ email }).exec();
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Generate invite token (simple random string)
  const inviteToken = crypto.randomBytes(20).toString('hex');
  const inviteTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days validity

  // Create user with invite token, role, org ref
  const invitedUser = new User({
    name,
    email,
    role,
    organizationId,
    verificationToken: inviteToken,
    verificationTokenExpiry: inviteTokenExpiry,
    isVerified: false,
  });

  // No password yet - user will set after accepting invite

  await invitedUser.save();
  return invitedUser;
}

// Helper function to get platformId for an organization
async function getOrganizationPlatformId(organizationId: string): Promise<string | null> {
  const org = await Organization.findById(organizationId).select('platformId').exec();
  return org?.platformId?.toString() || null;
}
