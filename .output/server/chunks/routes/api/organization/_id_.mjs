import { d as defineEventHandler, j as getRouterParam, e as getUserFromEvent, c as createError, O as Organization } from '../../../nitro/nitro.mjs';
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

const _id_ = defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const user = await getUserFromEvent(event);
    if (!user || user.role !== "super_admin") {
      throw createError({ statusCode: 403, statusMessage: "Unauthorized" });
    }
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: "Missing organization ID" });
    }
    try {
      const organization = await Organization.findById(id).lean();
      if (!organization) {
        throw createError({ statusCode: 404, statusMessage: "Organization not found" });
      }
      return {
        success: true,
        ...organization
      };
    } catch (err) {
      console.error("Error fetching organization:", err);
      throw createError({ statusCode: 500, statusMessage: "Failed to fetch organization" });
    }
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});

export { _id_ as default };
//# sourceMappingURL=_id_.mjs.map
