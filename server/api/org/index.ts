import type { H3Event } from 'h3'
import { getUserFromEvent } from '~/server/utils/auth'  // your auth helper
import Organization from '~/server/models/Organization' // ✅ use default import

export default async function (event: H3Event) {
  const user = await getUserFromEvent(event)
  if (!user) {
    return sendError(
      event,
      createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    )
  }

  // Assuming user has organizationId field
  const org = await Organization.findById(user.organizationId).lean()
  if (!org) {
    return sendError(
      event,
      createError({ statusCode: 404, statusMessage: 'Organization not found' })
    )
  }

  return org
}
