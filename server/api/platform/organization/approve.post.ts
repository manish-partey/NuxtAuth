// server/api/platform/organization/approve.post.ts
import { defineEventHandler, readBody, createError } from 'h3';
import { connectToDatabase } from '~/server/utils/db';
import { getUserFromEvent } from '~/server/utils/auth';
import { processOrganizationApproval } from '~/server/services/organization';

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();
    
    // Verify user is platform admin
    const user = await getUserFromEvent(event);
    if (!user || user.role !== 'platform_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only platform admins can approve organizations'
      });
    }

    const body = await readBody(event);
    const { organizationId, action, rejectionReason } = body;

    if (!organizationId || !action) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Organization ID and action are required'
      });
    }

    if (!['approve', 'reject'].includes(action)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Action must be either "approve" or "reject"'
      });
    }

    // Use the simplified organization service
    const result = await processOrganizationApproval(
      organizationId,
      action,
      user.id,
      rejectionReason
    );

    return {
      success: true,
      message: result.message,
      organization: {
        id: organizationId,
        status: action === 'approve' ? 'approved' : 'rejected'
      }
    };

  } catch (err: any) {
    console.error('[API] Organization approval error:', err);
    
    if (err.statusCode) {
      throw err;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Failed to process organization approval',
    });
  }
});
