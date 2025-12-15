import { defineEventHandler, createError } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import Organization from '~/server/models/Organization';
import Platform from '~/server/models/Platform';
import User from '~/server/models/User';
import DocumentType from '~/server/models/DocumentType';

export default defineEventHandler(async (event) => {
  try {
    // Check authentication and authorization
    const user = await getUserFromEvent(event);
    if (!user || user.role !== 'super_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only super admin can access stats'
      });
    }

    // Get total counts
    const totalPlatforms = await Platform.countDocuments();
    const totalOrganizations = await Organization.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalDocumentTypes = await DocumentType.countDocuments({ active: { $ne: false } });

    return {
      success: true,
      totalPlatforms,
      totalOrganizations,
      totalUsers,
      totalDocumentTypes
    };

  } catch (error: any) {
    console.error('[SUPERADMIN] Error loading stats:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to load stats'
    });
  }
});