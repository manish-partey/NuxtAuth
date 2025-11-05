import { H3Event, createError, defineEventHandler } from 'h3'
import { getUserFromEvent } from '~/server/utils/auth'

const publicPaths = [
  '/', '/login', '/register', '/forgot-password',
  '/verify-email', '/reset-password', '/organization-register', '/approve-organization',
  '/api/auth/login', '/api/auth/register',
  '/api/auth/forgot-password', '/api/auth/reset-password',
  '/api/auth/verify-email', '/api/user/me',
  '/api/platforms/list', '/api/platforms/seed', '/api/platform/organization/register',
  '/api/platform/organization/details', '/api/platform/organization/public-approve',
  '/api/org/register'
]

function getPathname(url: string): string {
  return url.split('?')[0]
}

export default defineEventHandler(async (event: H3Event) => {
  const reqUrl = event.node.req.url || ''
  const pathname = getPathname(reqUrl)

  console.log('[Auth Middleware] Incoming request:', pathname)

  // Allow all debug endpoints
  if (pathname.startsWith('/api/debug/')) {
    console.log('[Auth Middleware] Debug route - allowing:', pathname)
    return
  }

  const isPublic = publicPaths.some(path =>
    pathname === path || pathname.startsWith(path + '/')
  )

  if (isPublic) {
    console.log('[Auth Middleware] Public route:', pathname)
    return
  }

  try {
    const user = await getUserFromEvent(event)

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized: Missing or invalid token'
      })
    }

    event.context.user = user
  } catch (err) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
})

/**
 * ✅ Role-based middleware factory
 * Usage: await requireRole(['admin', 'super_admin'])(event)
 */
export function requireRole(allowedRoles: string[]) {
  return async (event: H3Event) => {
    let user = event.context.user
    if (!user) {
      user = await getUserFromEvent(event)
    }

    if (!user) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    if (!allowedRoles.includes(user.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: insufficient role'
      })
    }

    event.context.user = user
  }
}
