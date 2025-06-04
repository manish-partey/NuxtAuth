// server/utils/auth.ts
import jwt from 'jsonwebtoken';
import { H3Event, getHeader, getCookie } from 'h3';
import User from '../models/User'; // Ensure this path is correct in your project

const config = useRuntimeConfig();

// Now includes optional organizationId in the payload
export const generateAuthToken = (userId: string, role: string, organizationId?: string): string => {
  return jwt.sign({ userId, role, organizationId }, config.jwtSecret, { expiresIn: '1h' });
};

export const verifyAuthToken = (token: string) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return null;
  }
};

export const getUserFromEvent = async (event: H3Event) => {
  // Check Authorization header or fallback to cookie
  const authHeader = getHeader(event, 'Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : getCookie(event, 'auth_token');

  if (!token) {
    return null;
  }

  const decoded = verifyAuthToken(token);
  if (!decoded || typeof decoded === 'string') {
    return null;
  }

  // Fetch fresh user info from DB (recommended)
  const user = await User.findById(decoded.userId).populate('organizationId');
  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId?._id?.toString() || null,
  };
};
