// server/utils/auth.ts
import jwt from 'jsonwebtoken';
import { H3Event, getCookie } from 'h3';
import User from '../models/User';
import { IUserDocument } from '../types/user';

const config = useRuntimeConfig();

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
    { expiresIn: '7d' } // token expires in 7 days
  );
};

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
  try {
    const authHeader = event.node.req.headers['authorization'] || event.node.req.headers['Authorization'];
    let token: string | undefined;

    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else {
      token = getCookie(event, 'auth_token'); // match cookie name
    }

    if (!token) {
      console.log('[Auth] No token found in Authorization header or cookie');
      return null;
    }

    const decoded = verifyJwtToken(token);
    if (!decoded) {
      return null;
    }

    const user = await User.findById(decoded.userId)
      .populate('organizationId')
      .populate('platformId')
      .lean();

    if (!user) {
      console.log('[Auth] No user found for token userId:', decoded.userId);
      return null;
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId?._id?.toString?.() || null,
      platformId: user.platformId?._id?.toString?.() || null,
    };
  } catch (error) {
    console.warn('[Auth] getUserFromEvent failed:', error);
    return null;
  }
};
