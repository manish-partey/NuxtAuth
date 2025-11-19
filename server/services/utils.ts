// server/services/utils.ts
import User from '~/server/models/User';
import Organization from '~/server/models/Organization';

/**
 * Common utility functions for service layer
 */

/**
 * Check if user has permission to perform action in given context
 */
export async function hasPermission(
  userId: string, 
  requiredRole: string | string[], 
  contextPlatformId?: string, 
  contextOrganizationId?: string
) {
  const user = await User.findById(userId).select('role platformId organizationId');
  if (!user) return false;

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  // Check role match
  if (!roles.includes(user.role)) return false;

  // Context-specific checks
  switch (user.role) {
    case 'super_admin':
      return true; // Super admin has access everywhere

    case 'platform_admin':
      return !contextPlatformId || user.platformId?.toString() === contextPlatformId;

    case 'organization_admin':
      return (!contextPlatformId || user.platformId?.toString() === contextPlatformId) &&
             (!contextOrganizationId || user.organizationId?.toString() === contextOrganizationId);

    default:
      return false;
  }
}

/**
 * Get platform ID for an organization
 */
export async function getOrganizationPlatformId(organizationId: string): Promise<string | null> {
  const org = await Organization.findById(organizationId).select('platformId').exec();
  return org?.platformId?.toString() || null;
}

/**
 * Validate required fields
 */
export function validateRequired(fields: Record<string, any>, requiredFields: string[]) {
  const missing = requiredFields.filter(field => !fields[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}