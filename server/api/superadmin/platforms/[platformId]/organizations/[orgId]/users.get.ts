// server/api/superadmin/platforms/[platformId]/organizations/[orgId]/users.get.ts
import { defineEventHandler, createError } from 'h3';
import { requireRole } from '~/server/utils/auth';
import { connectToDatabase } from '~/server/utils/db';
import User from '~/server/models/User';

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();
    
    // Require super_admin authentication
    await requireRole(event, ['super_admin']);
    
    const orgId = event.context.params?.orgId;
    
    if (!orgId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Organization ID is required'
      });
    }
    
    // Get all users for this organization
    const users = await User.find({ organizationId: orgId })
      .select('name email role status isVerified createdAt lastLogin')
      .sort({ createdAt: -1 })
      .lean();
    
    return {
      success: true,
      users: users.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin || null
      })),
      total: users.length
    };
    
  } catch (error: any) {
    console.error('[SUPERADMIN-ORG-USERS] Error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch organization users'
    });
  }
});
