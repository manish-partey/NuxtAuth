// server/api/platform/settings/update.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { getUserFromEvent } from '~/server/utils/auth'
import Platform from '~/server/models/Platform'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)

  if (!user || user.role !== 'platform_admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const body = await readBody(event)

  try {
    const platform = await Platform.findById(user.platformId)
    if (!platform) {
      throw createError({ statusCode: 404, statusMessage: 'Platform not found' })
    }

    // Update only if fields exist in body
    if (body.name !== undefined) platform.name = body.name
    if (body.slug !== undefined) platform.slug = body.slug
    if (body.description !== undefined) platform.description = body.description
    if (body.status !== undefined) platform.status = body.status
    if (body.category !== undefined) {
      // Validate category
      const validCategories = ['healthcare', 'hospitality', 'education', 'logistics', 'other'];
      if (!validCategories.includes(body.category)) {
        throw createError({ 
          statusCode: 400, 
          statusMessage: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
        });
      }
      platform.category = body.category;
      
      // Clear allowedOrganizationTypes when changing category to use auto-filter
      if (body.clearAllowedTypes === true) {
        platform.allowedOrganizationTypes = [];
      }
    }

    await platform.save()

    return {
      success: true,
      message: 'Platform settings updated successfully.',
    }
  } catch (err: any) {
    console.error('[Platform Update Error]', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update platform settings.',
      data: err.message,
    })
  }
})
