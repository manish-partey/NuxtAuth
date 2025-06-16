// server/middleware/auth.ts
import { H3Event, createError, defineEventHandler } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';

const publicPaths = [
  '/', // 👈 allow unauthenticated access to homepage
  '/login',
  '/register',
  '/forgot-password',
  '/verify-email',
  '/reset-password',
];

// Helper: extract pathname without query string
function getPathname(url: string): string {
  return url.split('?')[0];
}

export default defineEventHandler(async (event: H3Event) => {
  const reqUrl = event.node.req.url || '';
  const pathname = getPathname(reqUrl);

  // Allow public routes without authentication
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    return;
  }

  try {
    const user = await getUserFromEvent(event);

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized: Authentication required',
      });
    }

    event.context.user = user;
  } catch (error) {
    console.error('Auth middleware error:', error);
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized access',
    });
  }
});

/**
 * Role-based authorization helper.
 * Throws 401 if not authenticated, 403 if role insufficient.
 */
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
