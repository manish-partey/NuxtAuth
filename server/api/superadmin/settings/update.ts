// server/api/superadmin/settings/update.ts
import { defineEventHandler, createError, readBody } from 'h3';
import { requireRole } from '~/server/utils/auth';

let globalSettings = {
  maxPlatforms: 10,
  maxOrganizationsPerPlatform: 100,
  enableSelfRegistration: false,
  defaultUserRole: 'user',
  maintenanceMode: false,
};


export default defineEventHandler(async (event) => {
  try {
  await requireRole(event, ['super_admin']);

  const body = await readBody(event);

  // Basic validation
  if (typeof body.maxPlatforms !== 'number' || body.maxPlatforms < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid maxPlatforms value' });
  }
  if (typeof body.maxOrganizationsPerPlatform !== 'number' || body.maxOrganizationsPerPlatform < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid maxOrganizationsPerPlatform value' });
  }
  if (typeof body.enableSelfRegistration !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid enableSelfRegistration value' });
  }
  if (!['user', 'organization_admin', 'platform_admin', 'super_admin'].includes(body.defaultUserRole)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid defaultUserRole value' });
  }
  if (typeof body.maintenanceMode !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid maintenanceMode value' });
  }

  // Update the global settings
  globalSettings = {
    maxPlatforms: body.maxPlatforms,
    maxOrganizationsPerPlatform: body.maxOrganizationsPerPlatform,
    enableSelfRegistration: body.enableSelfRegistration,
    defaultUserRole: body.defaultUserRole,
    maintenanceMode: body.maintenanceMode,
  };

  // TODO: Persist settings to DB for real use cases

  return {
    success: true,
    message: 'Settings updated successfully',
    settings: globalSettings,
  };
  } catch (err) {
    throw err;
  }
});
