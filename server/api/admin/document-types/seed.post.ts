import { getUserFromEvent } from '~/server/utils/auth';
import DocumentType from '~/server/models/DocumentType';

export default defineEventHandler(async (event) => {
  try {
    // Check authentication and authorization
    const user = await getUserFromEvent(event);
    if (!user || !['super_admin', 'platform_admin'].includes(user.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only super admin or platform admin can seed document types'
      });
    }

    // Sample document types for different layers
    const documentTypes = [
      // Platform layer documents
      {
        name: 'Business License',
        key: 'business_license',
        layer: 'platform',
        required: true,
        description: 'Official business registration and license documents',
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        order: 1
      },
      {
        name: 'Tax Registration Certificate',
        key: 'tax_certificate',
        layer: 'platform',
        required: true,
        description: 'Tax registration and compliance certificates',
        maxSize: 5 * 1024 * 1024,
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        order: 2
      },
      {
        name: 'Insurance Documentation',
        key: 'insurance_docs',
        layer: 'platform',
        required: false,
        description: 'Business insurance policies and coverage documents',
        maxSize: 10 * 1024 * 1024,
        allowedMimeTypes: ['application/pdf'],
        order: 3
      },

      // Organization layer documents
      {
        name: 'Company Registration',
        key: 'company_registration',
        layer: 'organization',
        required: true,
        description: 'Certificate of incorporation or company registration',
        maxSize: 5 * 1024 * 1024,
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        order: 1
      },
      {
        name: 'Authorized Signatory List',
        key: 'signatory_list',
        layer: 'organization',
        required: true,
        description: 'List of authorized signatories and their specimen signatures',
        maxSize: 5 * 1024 * 1024,
        allowedMimeTypes: ['application/pdf'],
        order: 2
      },
      {
        name: 'Banking Details',
        key: 'banking_details',
        layer: 'organization',
        required: false,
        description: 'Bank account details and verification documents',
        maxSize: 5 * 1024 * 1024,
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        order: 3
      },

      // User layer documents
      {
        name: 'Identity Proof',
        key: 'identity_proof',
        layer: 'user',
        required: true,
        description: 'Government issued ID proof (Passport, Driver License, etc.)',
        maxSize: 3 * 1024 * 1024,
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        order: 1
      },
      {
        name: 'Address Proof',
        key: 'address_proof',
        layer: 'user',
        required: true,
        description: 'Proof of current address (Utility bill, Bank statement, etc.)',
        maxSize: 3 * 1024 * 1024,
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        order: 2
      },
      {
        name: 'Professional Certificate',
        key: 'professional_cert',
        layer: 'user',
        required: false,
        description: 'Professional qualifications or certifications',
        maxSize: 5 * 1024 * 1024,
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        order: 3
      }
    ];

    // Clear existing document types
    await DocumentType.deleteMany({});

    // Insert new document types
    const createdDocTypes = await DocumentType.insertMany(documentTypes);

    console.log(`[SEED] Created ${createdDocTypes.length} document types`);

    return {
      success: true,
      message: `Successfully seeded ${createdDocTypes.length} document types`,
      documentTypes: createdDocTypes
    };

  } catch (error: any) {
    console.error('[SEED] Error seeding document types:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to seed document types'
    });
  }
});