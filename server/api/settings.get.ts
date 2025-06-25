// server/api/settings.get.ts
import Setting from '~/server/models/Setting';
import { getUserFromEvent } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event);
  if (!user || user.role !== 'super_admin') {
    throw createError({ statusCode: 403, statusMessage: 'Access denied' });
  }

  let setting = await Setting.findOne({ key: 'platform_settings' });
  if (!setting) {
    // Default settings if not found
    setting = await Setting.create({
      key: 'platform_settings',
      value: {
        maxPlatforms: 10,
        maxOrganizationsPerPlatform: 100,
        enableSelfRegistration: false,
        defaultUserRole: 'user',
        maintenanceMode: false
      }
    });
  }

  return {
    success: true,
    settings: setting.value
  };
});
