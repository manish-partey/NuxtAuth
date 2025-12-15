// server/api/settings.post.ts
import Setting from '~/server/models/Setting';
import { getUserFromEvent } from '~/server/utils/auth';
import { z } from 'zod';

const settingsSchema = z.object({
  maxPlatforms: z.number().min(1).optional(),
  maxOrganizationsPerPlatform: z.number().min(1).optional(),
  maintenanceMode: z.boolean().optional()
});

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event);
  if (!user || user.role !== 'super_admin') {
    throw createError({ statusCode: 403, statusMessage: 'Access denied' });
  }

  const body = await readBody(event);
  const validated = settingsSchema.parse(body); // throws if invalid

  // Merge with existing settings to preserve unmodified fields
  const existing = await Setting.findOne({ key: 'platform_settings' });
  const mergedValue = existing ? { ...existing.value, ...validated } : validated;

  const result = await Setting.findOneAndUpdate(
    { key: 'platform_settings' },
    { value: mergedValue },
    { upsert: true, new: true }
  );

  return {
    success: true,
    settings: result.value
  };
});
