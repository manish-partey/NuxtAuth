import { d as defineEventHandler, c as createError, e as getUserFromEvent, r as readBody, O as Organization } from '../../../nitro/nitro.mjs';
import { P as Platform } from '../../../_/Platform.mjs';
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

const create = defineEventHandler(async (event) => {
  try {
    if (event.method !== "POST") {
      throw createError({ statusCode: 405, statusMessage: "Method Not Allowed" });
    }
    const user = await getUserFromEvent(event);
    if (!user || user.role !== "super_admin") {
      throw createError({ statusCode: 403, statusMessage: "Unauthorized to create organization" });
    }
    const { name, platformId, type } = await readBody(event);
    if (!name || !platformId || !type) {
      throw createError({ statusCode: 400, statusMessage: "Missing required fields" });
    }
    const platform = await Platform.findById(platformId);
    if (!platform) {
      throw createError({ statusCode: 404, statusMessage: "Platform not found" });
    }
    const existing = await Organization.findOne({ name, platformId });
    if (existing) {
      throw createError({ statusCode: 409, statusMessage: "Organization already exists" });
    }
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const domain = `${slug}-${Date.now()}`;
    const organization = new Organization({
      name,
      type,
      slug,
      domain,
      status: "approved",
      platformId,
      createdBy: user.id
    });
    await organization.save();
    return {
      success: true,
      message: "Organization created",
      organizationId: organization._id
    };
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});

export { create as default };
//# sourceMappingURL=create.mjs.map
