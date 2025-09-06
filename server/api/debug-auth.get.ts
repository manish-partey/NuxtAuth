// server/api/debug-auth.get.ts

import { getCookie, getHeader, H3Event } from 'h3'
import jwt from 'jsonwebtoken'
import { getUserFromEvent } from '~/server/utils/auth'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const rawAuthHeader = getHeader(event, 'Authorization')
    const rawCookie = getCookie(event, 'auth_token')

    let decoded: any = null
    let user: any = null

    if (rawCookie) {
      decoded = jwt.decode(rawCookie)
    }

    user = await getUserFromEvent(event)

    return {
      method: event.method,
      authHeader: rawAuthHeader || 'Not present',
      cookieToken: rawCookie || 'Not present',
      decodedTokenPayload: decoded || 'Decoding failed',
      user: user || 'User not found or unauthenticated'
    }
  } catch (err: any) {
    console.error('[DebugAuth] Error in handler:', err);
    throw err;
  }
})
