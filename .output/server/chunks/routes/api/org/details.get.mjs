import { d as defineEventHandler, e as getUserFromEvent, c as createError, O as Organization } from '../../../nitro/nitro.mjs';
import { c as connectToDatabase } from '../../../_/db.mjs';
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
import 'mongodb';

const details_get = defineEventHandler(async (event) => {
  var _a;
  try {
    await connectToDatabase();
    const user = await getUserFromEvent(event);
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }
    let orgId = void 0;
    if (user.role === "organization_admin" && user.organizationId) {
      orgId = user.organizationId;
    } else if (user.role === "platform_admin" && user.platformId) {
      const url = new URL(event.node.req.url, `http://${event.node.req.headers.host}`);
      const queryOrgId = url.searchParams.get("organizationId");
      orgId = queryOrgId != null ? queryOrgId : void 0;
    } else if (user.role === "super_admin") {
      const url = new URL(event.node.req.url, `http://${event.node.req.headers.host}`);
      orgId = (_a = url.searchParams.get("organizationId")) != null ? _a : void 0;
    }
    if (!orgId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Organization ID not provided or not authorized"
      });
    }
    const organization = await Organization.findById(orgId).lean();
    if (!organization) {
      throw createError({ statusCode: 404, statusMessage: "Organization not found" });
    }
    return {
      success: true,
      organization
    };
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});

export { details_get as default };
//# sourceMappingURL=details.get.mjs.map
