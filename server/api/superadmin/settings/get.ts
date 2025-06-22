// server/api/superadmin/settings/get.ts
import { defineEventHandler, createError } from 'h3';
import { requireRole } from '~/server/middleware/auth';

// A simple in-memory store for demo purposes
// Replace with DB-based persistent storage in production
let globalSettings = {
  maxPlatforms: 10,
  maxOrganizationsPerPlatform: 100,
  enableSelfRegistration: false,
  defaultUserRole: 'user',
  maintenanceMode: false,
};

import { defaultClient } from 'applicationinsights';

export default defineEventHandler(async (event) => {
  try {
  // Only allow super_admin
  await requireRole(event, ['super_admin']);

  return {
    success: true,
    settings: globalSettings,
  };
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});
