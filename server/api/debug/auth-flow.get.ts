// server/api/debug/auth-flow.get.ts
import { getCookie } from 'h3';
import User from '~/server/models/User';

export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, 'auth_token');
    const authHeader = event.node.req.headers['authorization'];
    
    // Get all users count
    const usersCount = await User.countDocuments();
    
    // Get first user for testing
    const firstUser = await User.findOne({}).select('email role isVerified');
    
    return {
      cookieToken: token ? `Found (${token.substring(0, 20)}...)` : 'Not found',
      authHeader: authHeader ? `Found (${authHeader.substring(0, 20)}...)` : 'Not found',
      usersInDB: usersCount,
      firstUser: firstUser ? {
        email: firstUser.email,
        role: firstUser.role,
        isVerified: firstUser.isVerified,
      } : 'No users found',
    };
  } catch (err: any) {
    return { error: err.message };
  }
});
