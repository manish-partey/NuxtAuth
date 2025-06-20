// composables/useRoles.ts

export const allowedRolesByUserRole = {
  'super-admin': ['super-admin', 'platform-admin', 'organization-admin', 'admin', 'user'],
  'platform-admin': ['organization-admin', 'admin', 'user'],
  'organization-admin': ['admin', 'user'],
  // you can add more roles here if needed
};

export function getAllowedRolesForUserRole(userRole: string): string[] {
  return allowedRolesByUserRole[userRole] || [];
}
