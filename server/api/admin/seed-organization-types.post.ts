// server/api/admin/seed-organization-types.post.ts
import { defineEventHandler, createError } from 'h3';
import { requireRole } from '../../utils/auth';
import { connectDB } from '../../db/mongo';
import { seedOrganizationTypes } from '../../utils/seed-organization-types';
import { invalidateOrgTypeCache } from '~/server/utils/cache';
import { logAudit } from '~/server/services/audit';

export default defineEventHandler(async (event) => {
  try {
    console.log('[SEED-ORG-TYPES] Starting seed operation');
    
    // Verify authentication and authorization - only super admins
    const user = await requireRole(event, ['super_admin']);

    // Connect to database
    await connectDB();

    // Run the seed function
    const seededCount = await seedOrganizationTypes();

    // Invalidate cache to ensure fresh data
    invalidateOrgTypeCache();

    // Log audit
    await logAudit({
      action: 'SEED_ORG_TYPES',
      entityType: 'OrganizationType',
      entityId: 'system-seed',
      userId: user.id,
      details: {
        seededCount,
        method: 'admin_api'
      },
      event
    });

    console.log(`[SEED-ORG-TYPES] Completed: ${seededCount} types seeded`);

    return {
      success: true,
      message: `Successfully seeded ${seededCount} organization types`,
      seededCount
    };
  } catch (error: any) {
    console.error('[SEED-ORG-TYPES] Error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to seed organization types'
    });
  }
});
