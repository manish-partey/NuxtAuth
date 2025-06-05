// server/utils/auth.ts
import jwt from 'jsonwebtoken';
import { H3Event, getHeader, getCookie } from 'h3';
import User from '../models/User'; // Adjust if needed

const config = useRuntimeConfig();

/**
 * Generate JWT token with role and optional organization ID
 */
export const generateAuthToken = (
  userId: string,
  role: string,
  organizationId?: string
): string => {
  return jwt.sign({ userId, role, organizationId }, config.jwtSecret, {
    expiresIn: '1h',
  });
};

/**
 * Verify JWT token
 */
export const verifyAuthToken = (token: string) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch {
    return null;
  }
};

/**
 * Extract user from request event
 */
export const getUserFromEvent = async (event: H3Event) => {
  const authHeader = getHeader(event, 'Authorization');
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : getCookie(event, 'auth_token');

  if (!token) return null;

  const decoded = verifyAuthToken(token);
  if (!decoded || typeof decoded === 'string') return null;

  // ✅ FIX: Populate 'organization' not 'organizationId'
  const user = await User.findById(decoded.userId).populate('organization');
  if (!user) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organization?._id?.toString() || null,
  };
};
