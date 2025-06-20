// server/api/platform/list.ts
import { defineEventHandler, createError } from 'h3'
import { connectToDatabase } from '~/server/utils/db'
import Organization from '~/server/models/Organization'
import { getUserFromEvent } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  await connectToDatabase()

  try {
    // Define the types considered as platform types
    const platformTypes = ['grocery', 'college', 'doctor', 'platform'] // Adjust as per your schema

    // Fetch organizations of platform types
    const platforms = await Organization.find({ type: { $in: platformTypes } })
      .sort({ name: 1 })
      .lean()

    return {
      success: true,
      platforms,
    }
  } catch (err) {
    console.error('Failed to fetch platforms:', err)
    throw createError({ statusCode: 500, statusMessage: 'Failed to load platforms' })
  }
})
