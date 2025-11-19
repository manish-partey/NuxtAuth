import { defineEventHandler, getRouterParam, createError } from 'h3'
import { connectDB } from '~/server/db/mongo'
import { getUserFromEvent } from '~/server/utils/auth'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  try {
    const platformId = getRouterParam(event, 'id')
    
    if (!platformId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Platform ID is required'
      })
    }
    
    console.log(`📊 Platform Stats API - GET for platform: ${platformId}`)
    
    // Verify authentication and platform admin role
    const user = await getUserFromEvent(event)
    if (!user || user.role !== 'platform_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Platform admin access required'
      })
    }

    await connectDB()

    // Get platform and verify it exists
    const Platform = mongoose.model('Platform')
    const platform = await Platform.findById(platformId)
    
    if (!platform) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Platform not found'
      })
    }

    // For now, we'll allow any platform_admin to access any platform stats
    // TODO: Add proper platform admin assignment logic

    const Organization = mongoose.model('Organization')

    // Count organizations under this platform
    const organizationCount = await Organization.countDocuments({
      parentPlatform: platformId,
      active: true
    })

    // Count document types for this platform
    const DocumentType = mongoose.model('DocumentType')
    const requiredDocsCount = await DocumentType.countDocuments({
      'layerSpecificRequirements': {
        $elemMatch: {
          layer: 'platform',
          entityId: platformId.toString(),
          required: true
        }
      }
    })

    const optionalDocsCount = await DocumentType.countDocuments({
      'layerSpecificRequirements': {
        $elemMatch: {
          layer: 'platform',
          entityId: platformId.toString(),
          required: false
        }
      }
    })
    
    console.log(`✅ Platform stats: orgs=${organizationCount}, required=${requiredDocsCount}, optional=${optionalDocsCount}`)

    return {
      success: true,
      data: {
        organizationCount,
        requiredDocsCount,
        optionalDocsCount
      }
    }
  } catch (error: any) {
    console.error('❌ Platform Stats API Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to load platform stats'
    })
  }
})