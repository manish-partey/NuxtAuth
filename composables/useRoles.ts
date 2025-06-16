// composables/useRoles.ts (or a utils file)
export const allowedRolesByUserRole = {
  'super-admin': ['super-admin', 'platform-admin', 'organization-admin', 'admin', 'user'],
  'platform-admin': ['organization-admin', 'admin', 'user'],
  'organization-admin': ['admin', 'user'],
};

export function getAllowedRolesForUserRole(userRole: string): string[] {
  return allowedRolesByUserRole[userRole] || [];
}
