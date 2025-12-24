// server/utils/auth.ts
import { SignJWT, jwtVerify } from 'jose';
import { H3Event, getCookie, setCookie, createError } from 'h3';
import User from '../models/User';

// Store the server restart time in memory
const serverRestartedAt = Date.now();

export const generateAuthToken = async (
  userId: string,
  role: string,
  organizationId?: string,
  platformId?: string
): Promise<string> => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT secret is not configured!');
  }

  const secret = new TextEncoder().encode(jwtSecret);

  return await new SignJWT({
    userId,
    role,
    organizationId: organizationId || null,
    platformId: platformId || null,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
};

export const setSessionCookie = (event: H3Event, token: string) => {
  console.log('[Auth] Setting session cookie with token:', token.substring(0, 20) + '...');
  
  // Set with multiple cookie configurations to ensure compatibility
  setCookie(event, 'auth_token', token, {
    httpOnly: false, // Allow client-side access for debugging
    secure: false, // Disable secure for localhost development
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    domain: undefined, // Don't set domain for localhost
  });
  
  console.log('[Auth] Session cookie set successfully with config:', {
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
};

export const verifyJwtToken = async (token: string): Promise<null | {
  userId: string;
  role: string;
  organizationId?: string | null;
  platformId?: string | null;
}> => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT secret is not configured!');
    return null;
  }

  const secret = new TextEncoder().encode(jwtSecret);

  try {
    const { payload } = await jwtVerify(token, secret);

    // Skip server restart check in development
    if (process.env.NODE_ENV === 'production' && payload.iat && payload.iat * 1000 < serverRestartedAt) {
      console.warn('[Auth] Token issued before server restart. Invalidating token.');
      return null;
    }

    return payload as any;
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

    const decoded = await verifyJwtToken(token);
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

// Role hierarchy system - higher roles inherit permissions from lower roles
export const ROLE_HIERARCHY = {
  'super_admin': ['super_admin', 'platform_admin', 'organization_admin', 'manager', 'employee', 'guest'],
  'platform_admin': ['platform_admin', 'organization_admin', 'manager', 'employee', 'guest'],
  'organization_admin': ['organization_admin', 'manager', 'employee', 'guest'],
  'manager': ['manager', 'employee', 'guest'],
  'employee': ['employee', 'guest'],
  'guest': ['guest']
};

// API permission matrix
export const API_PERMISSIONS = {
  '/api/superadmin': ['super_admin'],
  '/api/platform-admin': ['super_admin', 'platform_admin'],
  '/api/org': ['super_admin', 'platform_admin', 'organization_admin'],
  '/api/user': ['super_admin', 'platform_admin', 'organization_admin', 'manager', 'employee'],
  '/api/admin': ['super_admin'],
  '/api/auth': [], // Public endpoints
  '/api/upload': ['super_admin', 'platform_admin', 'organization_admin', 'manager', 'employee']
};

export const hasPermission = (userRole: string, requiredRoles: string[]): boolean => {
  if (requiredRoles.length === 0) return true; // Public endpoint
  
  const userPermissions = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] || [];
  return requiredRoles.some(role => userPermissions.includes(role));
};

export const getApiPermissions = (apiPath: string): string[] => {
  // Find the most specific matching permission
  const pathSegments = apiPath.split('/').slice(0, 3).join('/'); // /api/[module]
  return API_PERMISSIONS[pathSegments as keyof typeof API_PERMISSIONS] || [];
};

export const requireAuth = async (event: H3Event) => {
  const user = await getUserFromEvent(event);
  
  if (!user || !user.role) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    });
  }
  
  return user;
};

export const requireRole = async (event: H3Event, allowedRoles: string[]) => {
  const user = await requireAuth(event);
  
  if (!hasPermission(user.role, allowedRoles)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Insufficient permissions'
    });
  }
  
  // Set user on event context for downstream handlers
  event.context.user = user;
  
  return user;
};

export const requireApiAccess = async (event: H3Event) => {
  const user = await requireAuth(event);
  const apiPath = event.node.req.url || '';
  const requiredRoles = getApiPermissions(apiPath);
  
  if (!hasPermission(user.role, requiredRoles)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Insufficient permissions for this endpoint'
    });
  }
  
  return user;
};

export const requireOrganizationAccess = async (event: H3Event, targetOrgId?: string) => {
  const user = await requireAuth(event);
  
  // Super admin and platform admin can access any organization
  if (['super_admin', 'platform_admin'].includes(user.role)) {
    return user;
  }
  
  // Organization admin can only access their own organization
  if (user.role === 'organization_admin') {
    if (!user.organizationId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'No organization assigned'
      });
    }
    
    if (targetOrgId && user.organizationId !== targetOrgId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Cannot access other organizations'
      });
    }
    
    return user;
  }
  
  // Regular users cannot access organization admin endpoints
  throw createError({
    statusCode: 403,
    statusMessage: 'Insufficient permissions'
  });
};

export const requirePlatformAccess = async (event: H3Event, targetPlatformId?: string) => {
  const user = await requireAuth(event);
  
  // Super admin can access any platform
  if (user.role === 'super_admin') {
    return user;
  }
  
  // Platform admin can only access their own platform
  if (user.role === 'platform_admin') {
    if (!user.platformId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'No platform assigned'
      });
    }
    
    if (targetPlatformId && user.platformId !== targetPlatformId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Cannot access other platforms'
      });
    }
    
    return user;
  }
  
  // Other roles cannot access platform admin endpoints
  throw createError({
    statusCode: 403,
    statusMessage: 'Insufficient permissions'
  });
};
