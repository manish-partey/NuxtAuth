// composables/useRoles.ts

type AllowedRoles = {
  [key: string]: string[];
};

export const allowedRolesByUserRole: AllowedRoles = {
  'super_admin': ['super_admin', 'platform-admin', 'organization-admin', 'admin', 'user'],
  'platform-admin': ['organization-admin', 'admin', 'user'],
  'organization-admin': ['admin', 'user'],
  // you can add more roles here if needed
};

type OrgRoleInfo = {
  label: string;
  description: string;
  permissions: string[];
};

type OrganizationRoles = {
  [key: string]: OrgRoleInfo;
};

// Organization-specific roles with descriptions
export const organizationRoles: OrganizationRoles = {
  'organization_admin': {
    label: 'Organization Admin',
    description: 'Full access to organization settings and all users',
    permissions: ['read_users', 'create_users', 'update_users', 'delete_users', 'read_documents', 'upload_documents', 'approve_documents', 'delete_documents', 'manage_settings', 'view_analytics', 'export_data', 'invite_users', 'remove_users', 'update_roles']
  },
  'manager': {
    label: 'Manager',
    description: 'Can manage users and approve documents',
    permissions: ['read_users', 'create_users', 'update_users', 'read_documents', 'upload_documents', 'approve_documents', 'view_analytics', 'invite_users']
  },
  'employee': {
    label: 'Employee',
    description: 'Can view users and manage documents',
    permissions: ['read_users', 'read_documents', 'upload_documents']
  },
  'guest': {
    label: 'Guest',
    description: 'Read-only access to documents',
    permissions: ['read_documents']
  }
};

export function getAllowedRolesForUserRole(userRole: string): string[] {
  return allowedRolesByUserRole[userRole] || [];
}

export function getOrganizationRoles(): string[] {
  return Object.keys(organizationRoles);
}

export function getRoleInfo(role: string): OrgRoleInfo | null {
  return organizationRoles[role] || null;
}

export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission);
}
