import { H3Event, createError, defineEventHandler, getCookie } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';

const publicPaths = [
  '/', '/login', '/register', '/forgot-password',
  '/verify-email', '/reset-password',
  '/api/auth/login', '/api/auth/register',
  '/api/auth/forgot-password', '/api/auth/reset-password',
  '/api/auth/verify-email', '/api/user/me'
];

function getPathname(url: string): string {
  return url.split('?')[0];
}

export default defineEventHandler(async (event: H3Event) => {
  const reqUrl = event.node.req.url || '';
  const pathname = getPathname(reqUrl);

  if (publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    return;
  }

  try {
    // ✅ Debug: Check if cookie is received
    const token = getCookie(event, 'auth_token');
    if (!token) {
      console.warn('[Auth Middleware] No auth_token found in cookies.');
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized: No token',
      });
    }

    const user = await getUserFromEvent(event);
    if (!user) {
      console.warn('[Auth Middleware] Invalid token or user not found.');
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized: Invalid token',
      });
    }

    event.context.user = user;
  } catch (error: any) {
    console.error('[Auth Middleware Error]', error);
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized access',
      data: error.message
    });
  }
});

export async function requireRole(event: H3Event, allowedRoles: string[]) {
  const user = await getUserFromEvent(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  if (!allowedRoles.includes(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: insufficient role',
    });
  }

  event.context.user = user;
}
