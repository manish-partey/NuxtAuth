// server/api/org/details.get.ts
import { defineEventHandler, createError } from 'h3'
import { connectToDatabase } from '~/server/utils/db'
import { getUserFromEvent } from '~/server/utils/auth'
import Organization from '~/server/models/Organization'

import { defaultClient } from 'applicationinsights';

export default defineEventHandler(async (event) => {
  try {
  await connectToDatabase()

  const user = await getUserFromEvent(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  let orgId: string | undefined = undefined

  // Determine the organization ID based on role
  if (user.role === 'organization_admin' && user.organizationId) {
    orgId = user.organizationId
  } else if (user.role === 'platform_admin' && user.platformId) {
    // For platform admin, allow optional query param
    const url = new URL(event.node.req.url!, `http://${event.node.req.headers.host}`)
    const queryOrgId = url.searchParams.get('organizationId')
    orgId = queryOrgId ?? undefined
  } else if (user.role === 'super_admin') {
    // Super admin can access any org using query param
    const url = new URL(event.node.req.url!, `http://${event.node.req.headers.host}`)
    orgId = url.searchParams.get('organizationId') ?? undefined
  }

  if (!orgId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Organization ID not provided or not authorized',
    })
  }

  const organization = await Organization.findById(orgId).lean()

  if (!organization) {
    throw createError({ statusCode: 404, statusMessage: 'Organization not found' })
  }

  return {
    success: true,
    organization,
  }
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
})
