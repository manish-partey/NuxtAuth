import { d as defineEventHandler, e as getUserFromEvent, c as createError, r as readBody } from '../../nitro/nitro.mjs';
import { S as Setting } from '../../_/Setting.mjs';
import { z } from 'zod';
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

const settingsSchema = z.object({
  maxPlatforms: z.number().min(1),
  maxOrganizationsPerPlatform: z.number().min(1),
  enableSelfRegistration: z.boolean(),
  defaultUserRole: z.enum(["user", "organization_admin"]),
  maintenanceMode: z.boolean()
});
const settings_post = defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event);
  if (!user || user.role !== "super_admin") {
    throw createError({ statusCode: 403, statusMessage: "Access denied" });
  }
  const body = await readBody(event);
  const validated = settingsSchema.parse(body);
  const result = await Setting.findOneAndUpdate(
    { key: "platform_settings" },
    { value: validated },
    { upsert: true, new: true }
  );
  return {
    success: true,
    settings: result.value
  };
});

export { settings_post as default };
//# sourceMappingURL=settings.post.mjs.map
