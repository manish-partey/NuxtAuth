import { getUserFromEvent } from '~/server/utils/auth';
import Document from '~/server/models/document';

export default defineEventHandler(async (event) => {
  try {
    // Check authentication
    const user = await getUserFromEvent(event);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      });
    }

    // All authenticated users can see their own stats
    // (employee, manager, guest for regular users; admins can view to test)

    // Get user ID
    const userId = user.id;

    // Get counts for user entities
    const [
      totalDocuments,
      pendingDocuments,
      approvedDocuments,
      rejectedDocuments,
      requiredDocuments,
      optionalDocuments
    ] = await Promise.all([
      Document.countDocuments({ layer: 'user', layerId: userId }),
      Document.countDocuments({ layer: 'user', layerId: userId, status: 'pending' }),
      Document.countDocuments({ layer: 'user', layerId: userId, status: 'approved' }),
      Document.countDocuments({ layer: 'user', layerId: userId, status: 'rejected' }),
      Document.countDocuments({ layer: 'user', layerId: userId, required: true }),
      Document.countDocuments({ layer: 'user', layerId: userId, required: false })
    ]);

    const stats = {
      documents: {
        total: totalDocuments,
        pending: pendingDocuments,
        approved: approvedDocuments,
        rejected: rejectedDocuments,
        required: requiredDocuments,
        optional: optionalDocuments
      },
      profile: {
        completionPercentage: calculateProfileCompletion(user)
      }
    };

    console.log(`[DASHBOARD] User stats retrieved for user ${userId}`);

    return {
      success: true,
      stats
    };

  } catch (error: any) {
    console.error('[DASHBOARD] Error fetching user stats:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch dashboard stats'
    });
  }
});

// Helper function to calculate profile completion
function calculateProfileCompletion(user: any): number {
  const fields = ['name', 'email', 'username'];
  const optionalFields = ['phone', 'address', 'profilePicture'];
  
  let completedFields = 0;
  let totalFields = fields.length;

  // Check required fields
  fields.forEach(field => {
    if (user[field]) completedFields++;
  });

  // Check optional fields (weighted less)
  optionalFields.forEach(field => {
    if (user[field]) completedFields += 0.5;
    totalFields += 0.5;
  });

  return Math.round((completedFields / totalFields) * 100);
}