// server/api/platform/users.get.ts
import { defineEventHandler, createError } from 'h3'
import { getUserFromEvent } from '~/server/utils/auth'
import User from '~/server/models/User'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)

  if (!user || user.role !== 'platform_admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  if (!user.platformId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing platformId' })
  }

  try {
    console.log('[PLATFORM-USERS] Fetching users for platform:', user.platformId);
    const Organization = (await import('~/server/models/Organization')).default;
    const users = await User.find({ platformId: user.platformId })
      .populate('organizationId', 'name')
      .select('-password')
      .sort({ createdAt: -1 })
      .lean()

    console.log('[PLATFORM-USERS] Found', users.length, 'users');
    console.log('[PLATFORM-USERS] Sample user organizationId:', users[0]?.organizationId);

    const usersWithOrgName = users.map((u: any) => ({
      ...u,
      organizationName: u.organizationId?.name || 'No Organization',
      status: u.isVerified ? 'active' : 'pending'
    }));

    return {
      success: true,
      users: usersWithOrgName,
    }
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch platform users',
      data: err.message,
    })
  }
})