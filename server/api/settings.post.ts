// server/api/settings.post.ts
import Setting from '~/server/models/Setting';
import { getUserFromEvent } from '~/server/utils/auth';
import { z } from 'zod';

const settingsSchema = z.object({
  maxPlatforms: z.number().min(1),
  maxOrganizationsPerPlatform: z.number().min(1),
  enableSelfRegistration: z.boolean(),
  defaultUserRole: z.enum(['user', 'organization_admin']),
  maintenanceMode: z.boolean()
});

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event);
  if (!user || user.role !== 'super_admin') {
    throw createError({ statusCode: 403, statusMessage: 'Access denied' });
  }

  const body = await readBody(event);
  const validated = settingsSchema.parse(body); // throws if invalid

  const result = await Setting.findOneAndUpdate(
    { key: 'platform_settings' },
    { value: validated },
    { upsert: true, new: true }
  );

  return {
    success: true,
    settings: result.value
  };
});
