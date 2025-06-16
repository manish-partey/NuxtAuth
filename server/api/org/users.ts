// server/api/org/users.ts
import type { H3Event } from 'h3'
import { getUserFromEvent } from '~/server/utils/auth'
import User from '~/server/models/User'

export default async function (event: H3Event) {
  const user = await getUserFromEvent(event)
  if (!user) return sendError(event, createError({ statusCode: 401, statusMessage: 'Unauthorized' }))

  const users = await User.find({ organizationId: user.organizationId }).select('_id name email role').lean()

  return users
}
