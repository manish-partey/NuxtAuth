// server/middleware/auth.ts
import { H3Event, createError, defineEventHandler } from 'h3'
import { getUserFromEvent } from '~/server/utils/auth'

/**
 * Public paths that bypass global auth middleware.
 */
const publicPaths = [
  '/', '/login', '/register', '/forgot-password',
  '/verify-email', '/reset-password',
  '/api/auth/login', '/api/auth/register',
  '/api/auth/forgot-password', '/api/auth/reset-password',
  '/api/auth/verify-email', '/api/user/me'
]

/**
 * Extract pathname (without query string).
 */
function getPathname(url: string): string {
  return url.split('?')[0]
}

/**
 * Global middleware for verifying JWT and attaching user to event context.
 */
export default defineEventHandler(async (event: H3Event) => {
  const reqUrl = event.node.req.url || ''
  const pathname = getPathname(reqUrl)

  const isPublic = publicPaths.some(path =>
    pathname === path || pathname.startsWith(path + '/')
  )

  if (isPublic) return

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
    console.error('[Auth Middleware Error]', err)
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
})

/**
 * Per-route role check for API handlers.
 */
export async function requireRole(event: H3Event, allowedRoles: string[]) {
  let user = event.context.user

  // Fallback: get user again (e.g., for routes that skip global middleware)
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
