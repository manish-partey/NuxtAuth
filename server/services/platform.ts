// server/services/platform.ts
import Platform from '~/server/models/Platform';
import User from '~/server/models/User';
import { hasPermission, validateRequired } from './utils';

interface CreatePlatformInput {
  name: string;
  slug: string;
  type: string;
  createdByUserId: string;
  description?: string;
}

/**
 * Create platform - simplified with common validation
 */
export async function createPlatform(data: CreatePlatformInput) {
  const { name, slug, type, createdByUserId, description } = data;

  validateRequired(data, ['name', 'slug', 'type', 'createdByUserId']);

  // Check permissions
  const canCreate = await hasPermission(createdByUserId, 'super_admin');
  if (!canCreate) {
    throw new Error('Only super admins can create platforms');
  }

  // Check for duplicates
  const existingPlatform = await Platform.findOne({ $or: [{ name }, { slug }] });
  if (existingPlatform) {
    throw new Error('Platform with this name or slug already exists');
  }

  const newPlatform = new Platform({
    name,
    slug,
    type,
    description,
    createdBy: createdByUserId,
  });
  await newPlatform.save();

  return newPlatform;
}

/**
 * Assign user as platform admin - simplified
 */
export async function assignPlatformAdmin(
  platformId: string,
  userId: string,
  assignedByUserId: string
) {
  const canAssign = await hasPermission(
    assignedByUserId, 
    ['super_admin', 'platform_admin'], 
    platformId
  );
  
  if (!canAssign) {
    throw new Error('Permission denied to assign platform admins');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User to assign not found');
  }

  user.role = 'platform_admin';
  user.platformId = platformId;
  await user.save();

  return user;
}

/**
 * Remove platform admin role - simplified
 */
export async function removePlatformAdmin(
  platformId: string,
  userId: string,
  removedByUserId: string
) {
  const canRemove = await hasPermission(
    removedByUserId, 
    ['super_admin', 'platform_admin'], 
    platformId
  );
  
  if (!canRemove) {
    throw new Error('Permission denied to remove platform admins');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.role !== 'platform_admin' || user.platformId?.toString() !== platformId) {
    throw new Error('User is not a platform admin of this platform');
  }

  user.role = 'user';
  user.platformId = null;
  await user.save();

  return user;
}

/**
 * List platform admins - simplified
 */
export async function listPlatformAdmins(platformId: string) {
  return User.find({
    role: 'platform_admin',
    platformId,
  }).select('name email username');
}