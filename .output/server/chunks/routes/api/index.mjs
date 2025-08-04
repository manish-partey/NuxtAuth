import { e as getUserFromEvent, h as sendError, c as createError, O as Organization } from '../../nitro/nitro.mjs';
import 'mongoose';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'applicationinsights';
import 'node:url';
import 'jsonwebtoken';
import 'bcryptjs';

async function index(event) {
  const user = await getUserFromEvent(event);
  if (!user) {
    return sendError(
      event,
      createError({ statusCode: 401, statusMessage: "Unauthorized" })
    );
  }
  const org = await Organization.findById(user.organizationId).lean();
  if (!org) {
    return sendError(
      event,
      createError({ statusCode: 404, statusMessage: "Organization not found" })
    );
  }
  return org;
}

export { index as default };
//# sourceMappingURL=index.mjs.map
