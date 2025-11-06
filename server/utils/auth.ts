// server/utils/auth.ts
import jwt from 'jsonwebtoken';
import { H3Event, getCookie } from 'h3';
import User from '../models/User';

export const generateAuthToken = (
  userId: string,
  role: string,
  organizationId?: string,
  platformId?: string
): string => {
  const config = useRuntimeConfig();
  if (!config.jwtSecret) {
    throw new Error('JWT secret is not configured!');
  }

  return jwt.sign(
    { userId, role, organizationId: organizationId || null, platformId: platformId || null },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
};

export const verifyJwtToken = (token: string): null | {
  userId: string;
  role: string;
  organizationId?: string | null;
  platformId?: string | null;
} => {
  const config = useRuntimeConfig();
  if (!config.jwtSecret) {
    console.error('JWT secret is not configured!');
    return null;
  }

  try {
    return jwt.verify(token, config.jwtSecret) as any;
  } catch (err: any) {
    console.warn('[Auth] JWT verification failed:', err.message);
    return null;
  }
};

export const getUserFromEvent = async (event: H3Event) => {
  try {
    const authHeader = event.node.req.headers['authorization'] || event.node.req.headers['Authorization'];
    let token: string | undefined;

    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else {
      token = getCookie(event, 'auth_token');
    }

    console.log('[Auth] Raw token from request:', token);

    if (!token) {
      console.warn('[Auth] No token found in Authorization header or cookie');
      return null;
    }

    const decoded = verifyJwtToken(token);
    console.log('[Auth] Decoded token:', decoded);

    if (!decoded) {
      console.warn('[Auth] Token verification failed');
      return null;
    }

    const user = await User.findById(decoded.userId).lean();
    if (!user || Array.isArray(user)) {
      console.warn('[Auth] User not found for userId:', decoded.userId);
      return null;
    }

    const userDoc = user as any;
    return {
      id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role,
      organizationId: userDoc.organizationId?.toString() ?? null,
      platformId: userDoc.platformId?.toString() ?? null,
    };
  } catch (error) {
    console.error('[Auth] getUserFromEvent failed:', error);
    return null;
  }
};
