import { d as defineEventHandler, i as requireRole, r as readBody, c as createError } from '../../../../nitro/nitro.mjs';
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

let globalSettings = {
  maxPlatforms: 10,
  maxOrganizationsPerPlatform: 100,
  enableSelfRegistration: false,
  defaultUserRole: "user",
  maintenanceMode: false
};
const update = defineEventHandler(async (event) => {
  try {
    await requireRole(event, ["super_admin"]);
    const body = await readBody(event);
    if (typeof body.maxPlatforms !== "number" || body.maxPlatforms < 1) {
      throw createError({ statusCode: 400, statusMessage: "Invalid maxPlatforms value" });
    }
    if (typeof body.maxOrganizationsPerPlatform !== "number" || body.maxOrganizationsPerPlatform < 1) {
      throw createError({ statusCode: 400, statusMessage: "Invalid maxOrganizationsPerPlatform value" });
    }
    if (typeof body.enableSelfRegistration !== "boolean") {
      throw createError({ statusCode: 400, statusMessage: "Invalid enableSelfRegistration value" });
    }
    if (!["user", "organization_admin", "platform_admin", "super_admin"].includes(body.defaultUserRole)) {
      throw createError({ statusCode: 400, statusMessage: "Invalid defaultUserRole value" });
    }
    if (typeof body.maintenanceMode !== "boolean") {
      throw createError({ statusCode: 400, statusMessage: "Invalid maintenanceMode value" });
    }
    globalSettings = {
      maxPlatforms: body.maxPlatforms,
      maxOrganizationsPerPlatform: body.maxOrganizationsPerPlatform,
      enableSelfRegistration: body.enableSelfRegistration,
      defaultUserRole: body.defaultUserRole,
      maintenanceMode: body.maintenanceMode
    };
    return {
      success: true,
      message: "Settings updated successfully",
      settings: globalSettings
    };
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});

export { update as default };
//# sourceMappingURL=update.mjs.map
