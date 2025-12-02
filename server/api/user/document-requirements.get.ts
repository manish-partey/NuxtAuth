import { connectDB } from '~/server/db/mongo'
import { getUserFromEvent } from '~/server/utils/auth'
import { createError, defineEventHandler } from 'h3'
import User from '~/server/models/User'
import Organization from '~/server/models/Organization'
import DocumentType from '~/server/models/DocumentType'
import Platform from '~/server/models/Platform'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    // Get authenticated user
    const currentUser = await getUserFromEvent(event)
    if (!currentUser) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    // Verify user role - any authenticated user can view their requirements
    if (!['user', 'organization_admin'].includes(currentUser.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied. Only users can view document requirements.'
      })
    }

    // Find user's organization
    const user = await User.findById(currentUser.id).populate({
      path: 'organization',
      populate: {
        path: 'parentPlatform'
      }
    })

    if (!user || !user.organization) {
      return {
        success: true,
        data: {
          organization: null,
          documents: []
        },
        message: 'User has no organization assigned'
      }
    }

    const organization = user.organization
    const platform = organization.parentPlatform

    // Get all document requirements for the platform
    const platformDocuments = await DocumentType.find({
      $or: [
        { layerSpecificRequirements: { platform: platform._id } },
        { layerSpecificRequirements: null }
      ]
    })

    // Get organization-specific document requirements
    const organizationDocuments = await DocumentType.find({
      layerSpecificRequirements: { organization: organization._id }
    })

    // Process platform documents
    const processedPlatformDocs = platformDocuments.map((doc: any) => {
      // Check if this document has platform-specific requirements
      let platformRequirement = null
      if (doc.layerSpecificRequirements?.platform?.equals(platform._id)) {
        platformRequirement = doc.layerSpecificRequirements
      } else if (!doc.layerSpecificRequirements) {
        // This is a default document requirement
        platformRequirement = {
          required: doc.isRequired,
          layer: 'platform'
        } as any;
      }

      if (platformRequirement) {
        return {
          _id: doc._id,
          name: doc.name,
          description: doc.description,
          allowedFormats: doc.allowedFormats,
          maxSize: doc.maxSize,
          required: (platformRequirement as any).required,
          layer: 'platform'
        }
      }
      return null
    }).filter(Boolean)

    // Process organization documents
    const processedOrgDocs = organizationDocuments.map((doc: any) => ({
      _id: doc._id,
      name: doc.name,
      description: doc.description,
      allowedFormats: doc.allowedFormats,
      maxSize: doc.maxSize,
      required: doc.layerSpecificRequirements.required,
      layer: 'organization'
    }))

    // Combine all documents
    const allDocuments = [
      ...processedPlatformDocs,
      ...processedOrgDocs
    ]

    console.log(`Loaded ${allDocuments.length} document requirements for user ${user.firstName} ${user.lastName}`)
    console.log(`Platform documents: ${processedPlatformDocs.length}, Organization documents: ${processedOrgDocs.length}`)

    return {
      success: true,
      data: {
        organization: {
          _id: organization._id,
          name: organization.name,
          description: organization.description,
          platformName: platform.name
        },
        documents: allDocuments
      },
      message: `Found ${allDocuments.length} document requirements`
    }

  } catch (error: any) {
    console.error('Error in user document requirements API:', error)
    
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.statusMessage || 'Internal server error'
    })
  }
})