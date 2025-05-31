// server/utils/auth.ts
import jwt from 'jsonwebtoken';
import { H3Event } from 'h3'; // Import H3Event for type hinting

const config = useRuntimeConfig();

export const generateAuthToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, config.jwtSecret, { expiresIn: '1h' });
};

export const verifyAuthToken = (token: string) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return null;
  }
};

export const getUserFromEvent = async (event: H3Event) => {
  const token = getHeader(event, 'Authorization')?.split(' ')[1];
  if (!token) {
    return null;
  }
  const decoded = verifyAuthToken(token);
  if (!decoded || typeof decoded === 'string') {
    return null;
  }
  // Optionally, fetch user from DB to ensure they still exist and token hasn't been revoked
  // import User from '../models/User';
  // return await User.findById(decoded.userId);
  return decoded; // Return decoded payload directly for simplicity in this guide
};