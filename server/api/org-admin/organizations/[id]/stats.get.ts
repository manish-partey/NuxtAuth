import { defineEventHandler, getRouterParam, createError } from 'h3'
import { connectDB } from '~/server/db/mongo'
import { getUserFromEvent } from '~/server/utils/auth'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  try {
    const organizationId = getRouterParam(event, 'id')
    
    if (!organizationId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Organization ID is required'
      })
    }
    
    console.log(`📊 Organization Stats API - GET for organization: ${organizationId}`)
    
    // Verify authentication and organization admin role
    const user = await getUserFromEvent(event)
    if (!user || user.role !== 'organization_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Organization admin access required'
      })
    }

    await connectDB()

    // Verify organization admin has access to this organization
    const Organization = mongoose.model('Organization')
    const organization = await Organization.findOne({
      _id: organizationId,
      organizationAdmins: user.id
    })
    
    if (!organization) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Organization not found or access denied'
      })
    }

    // Count users under this organization
    const User = mongoose.model('User')
    const userCount = await User.countDocuments({
      organizationId: organizationId,
      active: true
    })

    // Count document types for this organization
    const DocumentType = mongoose.model('DocumentType')
    const requiredDocsCount = await DocumentType.countDocuments({
      'layerSpecificRequirements': {
        $elemMatch: {
          layer: 'organization',
          entityId: organizationId.toString(),
          required: true
        }
      }
    })

    const optionalDocsCount = await DocumentType.countDocuments({
      'layerSpecificRequirements': {
        $elemMatch: {
          layer: 'organization',
          entityId: organizationId.toString(),
          required: false
        }
      }
    })

    // Count platform requirements inherited by this organization
    const platformRequiredCount = await DocumentType.countDocuments({
      'layerSpecificRequirements': {
        $elemMatch: {
          layer: 'platform',
          entityId: organization.parentPlatform.toString(),
          required: true
        }
      }
    })
    
    console.log(`✅ Organization stats: users=${userCount}, required=${requiredDocsCount}, optional=${optionalDocsCount}, platformRequired=${platformRequiredCount}`)

    return {
      success: true,
      data: {
        userCount,
        requiredDocsCount,
        optionalDocsCount,
        platformRequiredCount
      }
    }
  } catch (error: any) {
    console.error('❌ Organization Stats API Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to load organization stats'
    })
  }
})