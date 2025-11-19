import { defineEventHandler, createError } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    // Check authentication and authorization
    const user = await getUserFromEvent(event);
    if (!user || user.role !== 'platform_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only platform admin can view uploaded documents'
      });
    }

    const platformId = getRouterParam(event, 'id');
    if (!platformId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Platform ID is required'
      });
    }

    // TODO: Replace with actual uploaded documents query
    // For now, return mock data structure
    const mockUploadedDocuments = [
      {
        _id: '1',
        documentTypeId: 'doc-type-1',
        originalName: 'platform-license.pdf',
        filePath: '/uploads/platforms/platform-license.pdf',
        fileSize: 2048000,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user.id
      }
    ];

    return {
      success: true,
      documents: mockUploadedDocuments
    };

  } catch (error: any) {
    console.error('[PLATFORM ADMIN] Error fetching uploaded documents:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch uploaded documents'
    });
  }
});