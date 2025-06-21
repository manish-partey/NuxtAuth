// server/services/user.ts
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import Invitation from '../models/Invitation';
import { sendEmail } from '../utils/mail';
import { generateInviteEmail } from '../utils/emailTemplates/inviteUser';
import { useRuntimeConfig } from '#imports';

const allowedRoles = ['super_admin', 'platform_admin', 'organization_admin', 'user'] as const;
type UserRole = typeof allowedRoles[number];

interface CreateUserData {
  username: string;
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  platformId?: string;
  organizationId?: string;
  isVerified?: boolean;
}

export async function createUser(data: CreateUserData) {
  if (data.role && !allowedRoles.includes(data.role)) {
    throw new Error(`Invalid role: ${data.role}`);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = new User({
    ...data,
    password: hashedPassword,
  });
  await user.save();

  const safeUser = user.toObject();
  delete safeUser.password;
  return safeUser;
}

export async function getUserById(id: string) {
  return User.findById(id)
    .populate('platformId')
    .populate('organizationId')
    .select('-password')
    .exec();
}

export async function getUsersByPlatform(platformId: string) {
  return User.find({ platformId }).select('-password').exec();
}

export async function getUsersByOrganization(organizationId: string) {
  return User.find({ organizationId }).select('-password').exec();
}

export async function getUsersByRole(
  role: UserRole,
  platformId?: string,
  organizationId?: string
) {
  const filter: any = { role };

  if (platformId) {
    filter.platformId = platformId;
  }
  if (organizationId) {
    filter.organizationId = organizationId;
  }

  return User.find(filter).select('-password').exec();
}

export async function updateUser(id: string, updateData: Partial<CreateUserData>) {
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  return User.findByIdAndUpdate(id, updateData, { new: true }).select('-password').exec();
}

export async function deleteUser(id: string) {
  return User.findByIdAndDelete(id).exec();
}

export async function findUserByUsernameOrEmail(identifier: string) {
  return User.findOne({
    $or: [{ username: identifier }, { email: identifier }]
  }).select('+password').exec();
}

/**
 * Invite a user by email — creates a DB invitation + sends email
 */
export async function inviteUser({
  email,
  name,
  role,
  organizationId,
  platformId,
  inviterName = 'Admin'
}: {
  email: string;
  name: string;
  role: Exclude<UserRole, 'super_admin'>;
  platformId?: string;
  organizationId?: string;
  inviterName?: string;
}) {
  // Prevent duplicate users
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Prevent duplicate pending invites
  const existingInvite = await Invitation.findOne({ email, status: 'pending' });
  if (existingInvite) {
    throw new Error('An invitation is already pending for this email.');
  }

  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hrs

  const invitation = await Invitation.create({
    email,
    name,
    role,
    token,
    platformId,
    organizationId,
    status: 'pending',
    expiresAt
  });

  const config = useRuntimeConfig();
  const inviteLink = `${config.public.baseUrl}/accept-invite?token=${token}`;

  const html = generateInviteEmail({
    name,
    inviteLink,
    inviterName
  });

  await sendEmail(email, 'You’re Invited to EaseMyCargo', html);

  return invitation;
}
