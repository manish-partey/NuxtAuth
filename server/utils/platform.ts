import mongoose from 'mongoose';
import Organization from '../models/Organization';
import User from '../models/User';

/**
 * Normalize ID to ObjectId or null
 */
function toObjectId(
  id: mongoose.Types.ObjectId | string | undefined | null
): mongoose.Types.ObjectId | null {
  if (!id) return null;
  if (id instanceof mongoose.Types.ObjectId) return id;
  try {
    return new mongoose.Types.ObjectId(id);
  } catch {
    return null;
  }
}

/**
 * Get platformId from a given orgId
 */
export async function getPlatformIdFromOrg(
  orgId: mongoose.Types.ObjectId | string
): Promise<mongoose.Types.ObjectId | null> {
  const org = await Organization.findById(orgId)
    .select('platformId')
    .lean<{ platformId?: mongoose.Types.ObjectId | string } | null>();

  if (!org) return null;
  return toObjectId(org.platformId ?? null);
}

/**
 * Check if user belongs to a given organization
 */
export async function isUserInOrg(
  userId: mongoose.Types.ObjectId | string,
  orgId: mongoose.Types.ObjectId | string
): Promise<boolean> {
  const user = await User.findById(userId)
    .select('organizationId')
    .lean<{ organizationId?: mongoose.Types.ObjectId | string } | null>();

  if (!user) return false;
  return toObjectId(user.organizationId)?.toString() === toObjectId(orgId)?.toString();
}
