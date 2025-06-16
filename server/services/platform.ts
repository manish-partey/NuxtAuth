// server/services/platform.ts
import Platform from '~/server/models/Platform';
import User from '~/server/models/User';

interface CreatePlatformInput {
  name: string;
  createdByUserId: string; // for permission checks
  description?: string;
}

// Create platform service
export async function createPlatform(data: CreatePlatformInput) {
  const { name, createdByUserId, description } = data;

  // Validate inputs
  if (!name) {
    throw new Error('Platform name is required');
  }

  // Check for duplicates by name (since Platform model doesn't have domain field)
  const existingPlatform = await Platform.findOne({ name });
  if (existingPlatform) {
    throw new Error('Platform with this name already exists');
  }

  // Check if creator user exists and is super_admin
  const creator = await User.findById(createdByUserId);
  if (!creator || creator.role !== 'super_admin') {
    throw new Error('Only super admins can create platforms');
  }

  // Create platform
  const newPlatform = new Platform({ name, description });
  await newPlatform.save();

  return newPlatform;
}

// Assign user as platform admin
export async function assignPlatformAdmin(
  platformId: string,
  userId: string,
  assignedByUserId: string
) {
  // Only super_admin or platform_admin of the platform can assign platform admins
  const assigner = await User.findById(assignedByUserId);
  if (
    !assigner ||
    !(
      assigner.role === 'super_admin' ||
      (assigner.role === 'platform_admin' && assigner.platformId?.toString() === platformId)
    )
  ) {
    throw new Error('Permission denied to assign platform admins');
  }

  // Find user to assign
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User to assign not found');
  }

  // Assign role and platform ref
  user.role = 'platform_admin';
  user.platformId = platformId;
  await user.save();

  return user;
}

// Remove platform admin role from user
export async function removePlatformAdmin(
  platformId: string,
  userId: string,
  removedByUserId: string
) {
  // Same permission check as assign
  const remover = await User.findById(removedByUserId);
  if (
    !remover ||
    !(
      remover.role === 'super_admin' ||
      (remover.role === 'platform_admin' && remover.platformId?.toString() === platformId)
    )
  ) {
    throw new Error('Permission denied to remove platform admins');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.role !== 'platform_admin' || user.platformId?.toString() !== platformId) {
    throw new Error('User is not a platform admin of this platform');
  }

  // Demote to normal user or null role (adjust as needed)
  user.role = 'user';
  user.platformId = null;
  await user.save();

  return user;
}

// List all platform admins for a platform
export async function listPlatformAdmins(platformId: string) {
  const admins = await User.find({
    role: 'platform_admin',
    platformId,
  }).select('name email username');
  return admins;
}
