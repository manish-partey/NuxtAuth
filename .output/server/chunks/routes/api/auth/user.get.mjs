import { d as defineEventHandler, b as getCookie, e as getUserFromEvent } from '../../../nitro/nitro.mjs';
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
import 'jsonwebtoken';
import 'bcryptjs';

const user_get = defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, "auth_token");
    console.debug("[auth/user] Incoming auth_token cookie:", token);
    const user = await getUserFromEvent(event);
    if (!user) {
      return { user: null };
    }
    return { user };
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});

export { user_get as default };
//# sourceMappingURL=user.get.mjs.map
