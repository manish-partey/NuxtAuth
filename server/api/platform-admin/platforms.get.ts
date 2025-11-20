import { defineEventHandler, getQuery, createError } from 'h3'
import { connectDB } from '~/server/db/mongo'
import { getUserFromEvent } from '~/server/utils/auth'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  try {
    console.log('🏢 Platform Admin Platforms API - GET')
    
    // Verify authentication and platform admin role
    const user = await getUserFromEvent(event)
    if (!user || user.role !== 'platform_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Platform admin access required'
      })
    }

    await connectDB()

    // Get Platform model
    const Platform = mongoose.model('Platform')
    
    // For now, show all active platforms to platform admins
    // TODO: Add platform admin assignment logic
    const platforms = await Platform.find({
      status: 'active'
    }).select('name description status createdAt updatedAt')
    
    console.log(`✅ Found ${platforms.length} platforms for platform admin:`, user.id)

    return {
      success: true,
      data: platforms
    }
  } catch (error: any) {
    console.error('❌ Platform Admin Platforms API Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to load platforms'
    })
  }
})