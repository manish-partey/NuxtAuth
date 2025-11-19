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
    
    console.log(`📄 Organization Document Types API - GET for organization: ${organizationId}`)
    
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
    }).populate('parentPlatform', 'name')
    
    if (!organization) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Organization not found or access denied'
      })
    }

    // Get document types for this organization
    const DocumentType = mongoose.model('DocumentType')
    
    // Find platform-level document types (inherited)
    const platformDocTypes = await DocumentType.find({
      'layerSpecificRequirements': {
        $elemMatch: {
          layer: 'platform',
          entityId: organization.parentPlatform._id.toString()
        }
      }
    }).populate('createdBy', 'username email')
    
    // Find organization-level document types (specific to this org)
    const orgDocTypes = await DocumentType.find({
      'layerSpecificRequirements': {
        $elemMatch: {
          layer: 'organization',
          entityId: organizationId.toString()
        }
      }
    }).populate('createdBy', 'username email')
    
    // Transform platform documents to include required status and layer
    const platformDocs = platformDocTypes.map(docType => {
      const platformRequirement = docType.layerSpecificRequirements.find(
        (req: any) => req.layer === 'platform' && req.entityId === organization.parentPlatform._id.toString()
      )
      
      return {
        ...docType.toObject(),
        required: platformRequirement?.required || false,
        layer: 'platform'
      }
    })
    
    // Transform organization documents to include required status and layer
    const orgDocs = orgDocTypes.map(docType => {
      const orgRequirement = docType.layerSpecificRequirements.find(
        (req: any) => req.layer === 'organization' && req.entityId === organizationId.toString()
      )
      
      return {
        ...docType.toObject(),
        required: orgRequirement?.required || false,
        layer: 'organization'
      }
    })
    
    // Combine all documents
    const allDocuments = [...platformDocs, ...orgDocs]
    
    console.log(`✅ Found ${allDocuments.length} document types for organization (${platformDocs.length} platform + ${orgDocs.length} organization)`)

    return {
      success: true,
      data: allDocuments
    }
  } catch (error: any) {
    console.error('❌ Organization Document Types API Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to load organization document types'
    })
  }
})