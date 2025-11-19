// server/services/user.ts
import User from '../models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

//const allowedRoles = ['super_admin', 'platform_admin', 'organization_admin'] as const;
const allowedRoles = ['super_admin', 'platform_admin', 'organization_admin', 'Employee', 'Guest'] as const;
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

interface RegisterUserParams {
  username: string;
  email: string;
  role?: UserRole;
  platformId?: string;
  organizationId?: string;
  invitedByUserId?: string;
  isVerified?: boolean;
}

// ==================== USER CREATION & REGISTRATION ====================

/**
 * Basic user creation - used internally 
 */
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

/**
 * Context-aware user registration with role-based validation
 * Simplified version of previous auth.registerUser function
 */
export async function registerUser({
  username,
  email,
  role = 'Guest',
  platformId,
  organizationId,
  invitedByUserId,
  isVerified = false,
}: RegisterUserParams) {
  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new Error('Email or username already exists.');
  }

  // If there's an inviter, validate role-based permissions
  if (invitedByUserId) {
    const inviterUser = await User.findById(invitedByUserId);
    if (!inviterUser) throw new Error('Inviter user not found');

    // Apply role-based validation and inherit context
    const validation = validateRolePermissions(inviterUser.role, role, platformId, organizationId);
    if (!validation.valid) throw new Error(validation.error);
    
    // Inherit context from inviter
    platformId = validation.platformId || inviterUser.platformId?.toString();
    organizationId = validation.organizationId || inviterUser.organizationId?.toString();
  }

 
  const newUser = new User({
    username,
    email,
    role,
    platformId,
    organizationId,
    isVerified,
  });

  await newUser.save();

  const safeUser = newUser.toObject();
  delete safeUser.password;
  return safeUser;
}

/**
 * Create user for organization admin - generates password reset token and triggers email
 */
export async function createUserForOrg({
  name,
  email,
  role = 'Guest',
  organizationId,
  platformId,
  organizationName,
  createdByName
}: {
  name: string;
  email: string;
  role?: UserRole;
  organizationId: string;
  platformId?: string;
  organizationName?: string;
  createdByName?: string;
}) {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User with this email already exists.');
  }

  // Generate reset password token
  const resetPasswordToken = crypto.randomBytes(32).toString('hex');
  const resetPasswordExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create user with temporary password and reset token
  const tempPassword = 'temp_' + crypto.randomBytes(16).toString('hex');
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const user = new User({
    name,
    email,
    username: name, //email.split('@')[0] + '_' + Date.now(), // Generate unique username
    password: hashedPassword,
    role,
    organizationId,
    platformId,
    resetPasswordToken,
    resetPasswordExpiry,
    isVerified: false, // User must verify via password reset
  });

  await user.save();

  const safeUser = user.toObject();
  delete safeUser.password;

  return { user: safeUser, resetPasswordToken };
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Validate role permissions and inheritance - simplified from auth.ts logic
 */
function validateRolePermissions(
  inviterRole: string, 
  targetRole: string, 
  platformId?: string, 
  organizationId?: string
) {
  switch (inviterRole) {
    case 'super_admin':
      if (targetRole === 'platform_admin' && !platformId) {
        return { valid: false, error: 'Platform ID required for platform_admin role.' };
      }
      if (targetRole === 'organization_admin' && (!platformId || !organizationId)) {
        return { valid: false, error: 'Platform ID and Organization ID required for organization_admin role.' };
      }
      return { valid: true, platformId, organizationId };

    case 'platform_admin':
      if (targetRole === 'organization_admin' && !organizationId) {
        return { valid: false, error: 'Organization ID required for organization_admin role.' };
      }
      if (targetRole === 'user' && !organizationId) {
        return { valid: false, error: 'Organization ID required for user role.' };
      }
      return { valid: true, platformId, organizationId };

    case 'organization_admin':
      if (targetRole !== 'user') {
        return { valid: false, error: 'Org admins can only create users with role "user".' };
      }
      if (!organizationId) {
        return { valid: false, error: 'Organization ID required for user role.' };
      }
      return { valid: true, platformId, organizationId };

    default:
      return { valid: false, error: 'Inviter role is not authorized to create users.' };
  }
}

// ==================== USER QUERIES ====================

/**
 * Get user by ID with populated references
 */

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

// ==================== AUTHENTICATION HELPERS ====================

/**
 * Get authenticated user by ID (for auth verification)
 */
export async function getAuthUserById(userId: string) {
  return await User.findById(userId)
    .populate('organizationId')
    .populate('platformId')
    .select('-password')
    .lean();
}