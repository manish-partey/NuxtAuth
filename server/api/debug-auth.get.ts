// server/api/debug-auth.get.ts

import { getCookie, getHeader, H3Event } from 'h3'
import jwt from 'jsonwebtoken'
import { getUserFromEvent } from '~/server/utils/auth'

import { defaultClient } from 'applicationinsights';

export default defineEventHandler(async (event: H3Event) => {
  const rawAuthHeader = getHeader(event, 'Authorization')
  const rawCookie = getCookie(event, 'auth_token')

  let decoded: any = null
  let user: any = null

  try {
    if (rawCookie) {
      decoded = jwt.decode(rawCookie)
    }

    user = await getUserFromEvent(event)
  } catch (err: any) {
    console.error('[DebugAuth] Error decoding token or fetching user:', err)
  }

  return {
    method: event.method,
    authHeader: rawAuthHeader || 'Not present',
    cookieToken: rawCookie || 'Not present',
    decodedTokenPayload: decoded || 'Decoding failed',
    user: user || 'User not found or unauthenticated'
  }
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
})
