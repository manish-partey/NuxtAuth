// server/services/invitation.ts

import Invitation, { IInvitation } from '~/server/models/Invitation';
import crypto from 'crypto';
import { sendEmail } from '~/server/utils/mail';
import { generateInviteEmail } from '~/server/utils/emailTemplates/inviteUser';

interface InviteData {
  email: string;
  role: 'super_admin' | 'platform_admin' | 'organization_admin' | 'user';
  organizationId?: string;
  platformId?: string;
  inviterName?: string;
  baseUrl: string;
}

/**
 * Create and send an invitation email.
 */
export async function createAndSendInvite(data: InviteData): Promise<IInvitation> {
  // Check if the invite already exists and is pending
  const existing = await Invitation.findOne({
    email: data.email.toLowerCase(),
    organizationId: data.organizationId,
    status: 'pending',
  });

  if (existing) {
    throw new Error('User has already been invited to this organization.');
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const invite = await Invitation.create({
    email: data.email.toLowerCase(),
    role: data.role,
    organizationId: data.organizationId,
    platformId: data.platformId,
    inviterName: data.inviterName || 'Admin',
    token,
    status: 'pending',
    expiresAt,
  });

  const inviteLink = `${data.baseUrl}/accept-invite?token=${token}`;
  const emailHtml = generateInviteEmail({
    name: data.email,
    inviteLink,
    inviterName: data.inviterName || 'Admin',
  });

  await sendEmail(data.email, 'You are invited to join EaseMyCargo', emailHtml);

  return invite;
}

/**
 * Validate invitation token and return it if valid.
 */
export async function validateInviteToken(token: string): Promise<IInvitation | null> {
  const invite = await Invitation.findOne({ token, status: 'pending' }).exec();

  if (!invite) return null;

  if (invite.expiresAt < new Date()) {
    invite.status = 'expired';
    await invite.save();
    return null;
  }

  return invite;
}

/**
 * Mark an invitation as accepted.
 */
export async function markInviteAccepted(token: string): Promise<void> {
  const invite = await Invitation.findOne({ token, status: 'pending' }).exec();

  if (!invite) {
    throw new Error('Invalid or expired invitation token.');
  }

  invite.status = 'accepted';
  await invite.save();
}
