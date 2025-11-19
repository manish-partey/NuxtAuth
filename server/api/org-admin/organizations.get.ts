import { defineEventHandler, getQuery, createError } from 'h3'
import { connectDB } from '~/server/db/mongo'
import { getUserFromEvent } from '~/server/utils/auth'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  try {
    console.log('🏢 Organization Admin Organizations API - GET')
    
    // Verify authentication and organization admin role
    const user = await getUserFromEvent(event)
    if (!user || user.role !== 'organization_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Organization admin access required'
      })
    }

    await connectDB()

    // Get Organization model to find organizations this admin manages
    const Organization = mongoose.model('Organization')
    
    // Find organizations where user is an admin
    const organizations = await Organization.find({
      organizationAdmins: user.id,
      active: true
    }).populate('parentPlatform', 'name').select('name description active parentPlatform createdAt updatedAt')
    
    // Transform to include platform name
    const orgData = organizations.map(org => ({
      ...org.toObject(),
      platformName: org.parentPlatform?.name || 'Unknown Platform'
    }))
    
    console.log(`✅ Found ${organizations.length} organizations for admin:`, user.id)

    return {
      success: true,
      data: orgData
    }
  } catch (error: any) {
    console.error('❌ Organization Admin Organizations API Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to load organizations'
    })
  }
})