import { d as defineEventHandler, i as requireRole } from '../../../../nitro/nitro.mjs';
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
const get = defineEventHandler(async (event) => {
  try {
    await requireRole(event, ["super_admin"]);
    return {
      success: true,
      settings: globalSettings
    };
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});

export { get as default };
//# sourceMappingURL=get.mjs.map
