// server/api/admin/organization-types/review.get.ts
import { defineEventHandler } from 'h3';
import { requireRole } from '~/server/utils/auth';
import OrganizationType from '~/server/models/OrganizationType';
import Organization from '~/server/models/Organization';
import { getReviewPeriodDays, getAutoApprovalThreshold } from '~/server/services/config';

export default defineEventHandler(async (event) => {
  await requireRole(event, ['super_admin']);
  
  const reviewPeriod = await getReviewPeriodDays();
  const autoApproveThreshold = await getAutoApprovalThreshold();
  
  const reviewDate = new Date();
  reviewDate.setDate(reviewDate.getDate() - reviewPeriod);
  
  // Find platform-specific types that need review
  const typesForReview = await OrganizationType.find({
    scope: 'platform',
    status: 'active',
    $or: [
      { lastReviewedAt: { $lte: reviewDate } },
      { lastReviewedAt: null }
    ]
  })
    .populate('platformId', 'name')
    .populate('createdBy', 'name email')
    .lean();
  
  // Get usage count for each type
  const enrichedTypes = await Promise.all(
    typesForReview.map(async (type) => {
      const usageCount = await Organization.countDocuments({ type: type._id });
      
      // Check if similar types exist across platforms
      const similarTypes = await OrganizationType.find({
        code: type.code,
        scope: 'platform',
        status: 'active',
        _id: { $ne: type._id }
      });
      
      const promotionEligible = similarTypes.length >= autoApproveThreshold - 1;
      
      return {
        ...type,
        usageCount,
        similarTypesCount: similarTypes.length,
        promotionEligible,
        daysSinceCreation: Math.floor((Date.now() - new Date(type.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      };
    })
  );
  
  return {
    success: true,
    organizationTypes: enrichedTypes,
    count: enrichedTypes.length,
    autoApprovalThreshold: autoApproveThreshold
  };
});
