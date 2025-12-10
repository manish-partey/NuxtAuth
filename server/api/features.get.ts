import { defineEventHandler } from 'h3';
import { requireAuth } from '~/server/utils/auth';
import { getEnabledFeaturesForRole } from '~/server/utils/feature-guard';
import { features } from '~/server/config/features';

/**
 * GET /api/features
 * 
 * Returns enabled features based on user's role.
 * This allows the frontend to conditionally show/hide UI elements.
 */
export default defineEventHandler(async (event) => {
  try {
    const currentUser = await requireAuth(event);
    const role = currentUser.role?.toLowerCase();

    let roleFeatures = {};
    
    // Get features based on role
    if (role === 'organization_admin') {
      roleFeatures = getEnabledFeaturesForRole('orgAdmin');
    } else if (role === 'platform_admin') {
      roleFeatures = getEnabledFeaturesForRole('platformAdmin');
    } else if (role === 'super_admin') {
      roleFeatures = getEnabledFeaturesForRole('superAdmin');
    }

    // Include general features for all users
    const generalFeatures = getEnabledFeaturesForRole('general');

    return {
      role,
      features: {
        ...roleFeatures,
        general: generalFeatures,
      },
      // Also return the raw feature objects for more granular checks
      raw: {
        orgAdmin: role === 'organization_admin' ? features.orgAdmin : undefined,
        platformAdmin: role === 'platform_admin' ? features.platformAdmin : undefined,
        superAdmin: role === 'super_admin' ? features.superAdmin : undefined,
        general: features.general,
      },
    };
  } catch (error: any) {
    // If not authenticated, return only general features
    return {
      role: null,
      features: {
        general: getEnabledFeaturesForRole('general'),
      },
      raw: {
        general: features.general,
      },
    };
  }
});
