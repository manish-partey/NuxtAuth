// server/api/org/settings.ts
import type { H3Event } from 'h3'
import { getUserFromEvent } from '~/server/utils/auth'
import Organization from '~/server/models/Organization';
import { readBody, sendError, createError } from 'h3'

export default async function (event: H3Event) {
  const user = await getUserFromEvent(event)
  if (!user) return sendError(event, createError({ statusCode: 401, statusMessage: 'Unauthorized' }))

  if (event.req.method === 'GET') {
    const org = await Organization.findById(user.organizationId).lean()
    if (!org) return sendError(event, createError({ statusCode: 404, statusMessage: 'Organization not found' }))
    return (org as any).settings || {}
  }

  if (event.req.method === 'PUT') {
    const body = await readBody(event)
    const updatedSettings = body.settings
    if (!updatedSettings) return sendError(event, createError({ statusCode: 400, statusMessage: 'Settings are required' }))

    const org = await Organization.findById(user.organizationId)
    if (!org) return sendError(event, createError({ statusCode: 404, statusMessage: 'Organization not found' }))

    org.settings = updatedSettings
    await org.save()

    return { message: 'Settings updated successfully' }
  }

  return sendError(event, createError({ statusCode: 405, statusMessage: 'Method Not Allowed' }))
}
