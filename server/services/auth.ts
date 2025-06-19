// server/services/auth.ts
import User from '~/server/models/User';
import Platform from '~/server/models/Platform';
import Organization from '~/server/models/Organization';
import bcrypt from 'bcryptjs';

interface RegisterUserParams {
  username: string;
  email: string;
  password: string;
  role?: 'super_admin' | 'platform_admin' | 'org_admin' | 'user';
  platformId?: string;
  organizationId?: string;
  invitedByUserId?: string;
}

/**
 * Context-aware user registration / invitation
 */
export async function registerUser({
  username,
  email,
  password,
  role = 'user',
  platformId,
  organizationId,
  invitedByUserId,
}: RegisterUserParams) {
  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new Error('Email or username already exists.');
  }

  // Fetch inviter user
  if (!invitedByUserId) throw new Error('Inviter user ID is required');

  const inviterUser = await User.findById(invitedByUserId);
  if (!inviterUser) throw new Error('Inviter user not found');

  const invitedByRole = inviterUser.role;

  // Role-based logic
  switch (invitedByRole) {
    case 'super_admin':
      if (role === 'platform_admin' && !platformId) {
        throw new Error('Platform ID required for platform_admin role.');
      }
      if (role === 'org_admin' && (!platformId || !organizationId)) {
        throw new Error('Platform ID and Organization ID required for org_admin role.');
      }
      break;

    case 'platform_admin':
      if (role === 'org_admin' && !organizationId) {
        throw new Error('Organization ID required for org_admin role.');
      }
      if (role === 'user' && !organizationId) {
        throw new Error('Organization ID required for user role.');
      }
      // Force platformId from inviter
      platformId = inviterUser.platformId?.toString() || platformId;
      break;

    case 'org_admin':
      if (role !== 'user') {
        throw new Error('Org admins can only create users with role "user".');
      }
      if (!organizationId) {
        throw new Error('Organization ID required for user role.');
      }
      // Force both platformId and organizationId from inviter
      platformId = inviterUser.platformId?.toString();
      organizationId = inviterUser.organizationId?.toString();
      break;

    default:
      throw new Error('Inviter role is not authorized to create users.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    role,
    platformId,
    organizationId,
    isVerified: false,
  });

  await newUser.save();

  const safeUser = newUser.toObject();
  delete safeUser.password;
  return safeUser;
}

/**
 * Get user by ID and populate org + platform
 */
export async function getAuthUserById(userId: string) {
  return await User.findById(userId)
    .populate('organizationId')
    .populate('platformId')
    .select('-password')
    .lean();
}

/**
 * Login using email or username
 */
export async function loginUser(emailOrUsername: string, password: string) {
  const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  return user;
}
