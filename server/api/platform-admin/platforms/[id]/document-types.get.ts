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
    
    console.log(`📄 Platform Document Types API - GET for platform: ${platformId}`)
    
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

    // For now, we'll allow any platform_admin to access any platform
    // TODO: Add proper platform admin assignment logic

    // Get document types for this platform
    const DocumentType = mongoose.model('DocumentType')
    
    // Find all document types that have requirements for this platform
    const documentTypes = await DocumentType.find({
      'layerSpecificRequirements': {
        $elemMatch: {
          layer: 'platform',
          entityId: platformId.toString()
        }
      }
    }).populate('createdBy', 'username email')
    
    // Transform the results to include the platform-specific required flag
    const platformDocTypes = documentTypes.map(docType => {
      const platformRequirement = docType.layerSpecificRequirements.find(
        (req: any) => req.layer === 'platform' && req.entityId === platformId.toString()
      )
      
      return {
        ...docType.toObject(),
        required: platformRequirement?.required || false
      }
    })
    
    console.log(`✅ Found ${platformDocTypes.length} document types for platform`)

    return {
      success: true,
      data: platformDocTypes
    }
  } catch (error: any) {
    console.error('❌ Platform Document Types API Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to load platform document types'
    })
  }
})