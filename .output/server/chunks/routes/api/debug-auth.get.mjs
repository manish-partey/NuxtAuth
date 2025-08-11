import { d as defineEventHandler, f as getHeader, b as getCookie, e as getUserFromEvent } from '../../nitro/nitro.mjs';
import jwt from 'jsonwebtoken';
import { defaultClient } from 'applicationinsights';
import 'mongoose';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'bcryptjs';

const debugAuth_get = defineEventHandler(async (event) => {
  try {
    const rawAuthHeader = getHeader(event, "Authorization");
    const rawCookie = getCookie(event, "auth_token");
    let decoded = null;
    let user = null;
    if (rawCookie) {
      decoded = jwt.decode(rawCookie);
    }
    user = await getUserFromEvent(event);
    return {
      method: event.method,
      authHeader: rawAuthHeader || "Not present",
      cookieToken: rawCookie || "Not present",
      decodedTokenPayload: decoded || "Decoding failed",
      user: user || "User not found or unauthenticated"
    };
  } catch (err) {
    defaultClient.trackException({ exception: err });
    console.error("[DebugAuth] Error in handler:", err);
    throw err;
  }
});

export { debugAuth_get as default };
//# sourceMappingURL=debug-auth.get.mjs.map
