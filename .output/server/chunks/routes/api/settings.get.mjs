import { d as defineEventHandler, e as getUserFromEvent, c as createError } from '../../nitro/nitro.mjs';
import { S as Setting } from '../../_/Setting.mjs';
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

const settings_get = defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event);
  if (!user || user.role !== "super_admin") {
    throw createError({ statusCode: 403, statusMessage: "Access denied" });
  }
  let setting = await Setting.findOne({ key: "platform_settings" });
  if (!setting) {
    setting = await Setting.create({
      key: "platform_settings",
      value: {
        maxPlatforms: 10,
        maxOrganizationsPerPlatform: 100,
        enableSelfRegistration: false,
        defaultUserRole: "user",
        maintenanceMode: false
      }
    });
  }
  return {
    success: true,
    settings: setting.value
  };
});

export { settings_get as default };
//# sourceMappingURL=settings.get.mjs.map
