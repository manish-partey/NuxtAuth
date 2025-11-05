// server/api/debug/full-auth-check.get.ts
import { getCookie } from 'h3';
import { verifyJwtToken } from '~/server/utils/auth';
import User from '~/server/models/User';

export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, 'auth_token');
    const authHeader = event.node.req.headers['authorization'];
    
    console.log('[FULL-AUTH-CHECK] Checking auth...');
    
    let result: any = {
      timestamp: new Date().toISOString(),
      cookiePresent: !!token,
      headerPresent: !!authHeader,
    };

    // Check cookie
    if (token) {
      console.log(`[FULL-AUTH-CHECK] Found token in cookie: ${token.substring(0, 30)}...`);
      const decoded = verifyJwtToken(token);
      result.cookieTokenValid = !!decoded;
      result.cookieTokenDecoded = decoded;
      
      if (decoded?.userId) {
        const user = await User.findById(decoded.userId);
        result.userFoundInDB = !!user;
        if (user) {
          result.userDetails = {
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            organizationId: user.organizationId?.toString(),
          };
        }
      }
    } else {
      console.log('[FULL-AUTH-CHECK] No token in cookie');
    }

    // Check header
    if (authHeader) {
      console.log(`[FULL-AUTH-CHECK] Found auth header: ${authHeader.substring(0, 30)}...`);
      let headerToken = authHeader;
      if (authHeader.startsWith('Bearer ')) {
        headerToken = authHeader.slice(7).trim();
      }
      
      const decoded = verifyJwtToken(headerToken);
      result.headerTokenValid = !!decoded;
      result.headerTokenDecoded = decoded;
    }

    // Check all users
    const allUsers = await User.find({}).select('email role isVerified').limit(5);
    result.usersInDB = allUsers.map(u => ({
      email: u.email,
      role: u.role,
      isVerified: u.isVerified,
    }));

    console.log('[FULL-AUTH-CHECK] Result:', JSON.stringify(result, null, 2));
    return result;
  } catch (err: any) {
    console.error('[FULL-AUTH-CHECK] Error:', err);
    return { error: err.message, stack: err.stack };
  }
});
