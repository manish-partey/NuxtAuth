// server/utils/auth.ts
import jwt from 'jsonwebtoken';
import { H3Event, getCookie } from 'h3';
import User from '../models/User';
import { IUserDocument } from '../types/user';

const config = useRuntimeConfig();

/**
 * Generate JWT token including role and optional organization/platform ID
 */
export const generateAuthToken = (
  userId: string,
  role: string,
  organizationId?: string,
  platformId?: string
): string => {
  if (!config.jwtSecret) {
    throw new Error('JWT secret is not configured!');
  }

  return jwt.sign(
    { userId, role, organizationId, platformId },
    config.jwtSecret,
    {
      expiresIn: '1h',
    }
  );
};

/**
 * Verify JWT token and return decoded payload or null
 */
export const verifyJwtToken = (token: string): null | {
  userId: string;
  role: string;
  organizationId?: string;
  platformId?: string;
} => {
  if (!config.jwtSecret) {
    console.error('JWT secret is not configured!');
    return null;
  }

  try {
    return jwt.verify(token, config.jwtSecret) as {
      userId: string;
      role: string;
      organizationId?: string;
      platformId?: string;
    };
  } catch (err: any) {
    console.warn('JWT verification failed:', err.message);
    return null;
  }
};

/**
 * Extract user from H3 event with role, org, and platform info
 */
export const getUserFromEvent = async (
  event: H3Event
): Promise<null | {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string | null;
  platformId: string | null;
}> => {
  // Try to extract token from Authorization header (case insensitive)
  const authHeader =
    event.node.req.headers['authorization'] ||
    event.node.req.headers['Authorization'];

  let token: string | undefined;

  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else {
    // fallback to auth_token cookie
    token = getCookie(event, 'auth_token');
  }

  if (!token) {
    console.log('No auth token found in Authorization header or cookie');
    return null;
  }

  const decoded = verifyJwtToken(token);
  if (!decoded) {
    console.log('Invalid or expired JWT token');
    return null;
  }

  // Find user by decoded userId and populate organization and platform refs
  const user = (await User.findById(decoded.userId)
    .populate('organization')
    .populate('platform')) as IUserDocument | null;

  if (!user) {
    console.log('User not found for id:', decoded.userId);
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organization?._id?.toString() || null,
    platformId: user.platform?._id?.toString() || null,
  };
};
