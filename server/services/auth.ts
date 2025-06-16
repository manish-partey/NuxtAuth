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
  invitedByUserId?: string; // Changed to inviter user ID to fetch inviter details
}

/**
 * Context-aware user registration / invitation
 * Decides role and linkage based on who is inviting
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

  // Fetch inviter user to enforce context-based restrictions
  let inviterUser = null;
  let invitedByRole = '';
  if (invitedByUserId) {
    inviterUser = await User.findById(invitedByUserId);
    if (!inviterUser) throw new Error('Inviter user not found');
    invitedByRole = inviterUser.role;
  } else {
    throw new Error('Inviter user ID is required');
  }

  // Validate roles & references based on inviter's role
  switch (invitedByRole) {
    case 'super_admin':
      // super_admin can create any user, including platform_admin and org_admin
      if (role === 'platform_admin' && !platformId) {
        throw new Error('Platform ID required for platform_admin role.');
      }
      if (role === 'org_admin' && (!platformId || !organizationId)) {
        throw new Error('Platform ID and Organization ID required for org_admin role.');
      }
      break;

    case 'platform_admin':
      // platform_admin can create org_admin or user under their platform
      if (role === 'org_admin' && !organizationId) {
        throw new Error('Organization ID required for org_admin role.');
      }
      if (role === 'user') {
        if (!organizationId) {
          throw new Error('Organization ID required for user role.');
        }
      }
      // Force platformId to inviter's platformId to prevent spoofing
      platformId = inviterUser.platform?.toString() || platformId;
      break;

    case 'org_admin':
      // org_admin can only create normal users under their organization
      if (role !== 'user') {
        throw new Error('Org admins can only create users with role "user".');
      }
      if (!organizationId) {
        throw new Error('Organization ID required for user role.');
      }
      // Force platformId and organizationId from inviter's context
      platformId = inviterUser.platform?.toString();
      organizationId = inviterUser.organization?.toString();
      break;

    default:
      throw new Error('Inviter role is not authorized to create users.');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    role,
    platform: platformId,
    organization: organizationId,
    isVerified: false, // for invitation flows, you might want to verify by email link
  });

  await newUser.save();

  // Return user without password
  const safeUser = newUser.toObject();
  delete safeUser.password;
  return safeUser;
}

export async function getAuthUserById(userId: string) {
  const user = await User.findById(userId).select('-password');
  return user;
}

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
