// server/api/org/users.get.ts
import { defineEventHandler, createError } from 'h3'
import { getUserFromEvent } from '~/server/utils/auth'
import User from '~/server/models/User'
import { connectToDatabase } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()

    const user = await getUserFromEvent(event)

    if (!user || user.role !== 'organization_admin') {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: Not authorized' })
    }

    const users = await User.find({
      organizationId: user.organizationId,
      role: { $in: ['employee', 'manager', 'guest', 'organization_admin'] }, // restrict to relevant roles
    })
      .select('_id name email role createdAt')
      .sort({ createdAt: -1 })
      .lean()

    return { success: true, users }
  } catch (err) {
    console.error('[org/users.get] Error:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch organization users',
      data: err instanceof Error ? err.message : String(err),
    })
  }
})
