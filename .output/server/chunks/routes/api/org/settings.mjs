import { e as getUserFromEvent, h as sendError, c as createError, O as Organization, r as readBody } from '../../../nitro/nitro.mjs';
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

async function settings(event) {
  const user = await getUserFromEvent(event);
  if (!user) return sendError(event, createError({ statusCode: 401, statusMessage: "Unauthorized" }));
  if (event.req.method === "GET") {
    const org = await Organization.findById(user.organizationId).lean();
    if (!org) return sendError(event, createError({ statusCode: 404, statusMessage: "Organization not found" }));
    return org.settings || {};
  }
  if (event.req.method === "PUT") {
    const body = await readBody(event);
    const updatedSettings = body.settings;
    if (!updatedSettings) return sendError(event, createError({ statusCode: 400, statusMessage: "Settings are required" }));
    const org = await Organization.findById(user.organizationId);
    if (!org) return sendError(event, createError({ statusCode: 404, statusMessage: "Organization not found" }));
    org.settings = updatedSettings;
    await org.save();
    return { message: "Settings updated successfully" };
  }
  return sendError(event, createError({ statusCode: 405, statusMessage: "Method Not Allowed" }));
}

export { settings as default };
//# sourceMappingURL=settings.mjs.map
