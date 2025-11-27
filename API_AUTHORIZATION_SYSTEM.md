# API Authorization System Documentation

## Overview

This document outlines the comprehensive API authorization system implemented for the NuxtAuth application. The system provides role-based access control (RBAC) with a hierarchical permission model.

## Role Hierarchy

The system implements a role hierarchy where higher-level roles inherit permissions from lower-level roles:

```typescript
ROLE_HIERARCHY = {
  'super_admin': ['super_admin', 'platform_admin', 'organization_admin', 'user'],
  'platform_admin': ['platform_admin', 'organization_admin', 'user'],
  'organization_admin': ['organization_admin', 'user'],
  'user': ['user']
}
```

### Role Descriptions

- **super_admin**: Full system access, can manage all platforms, organizations, and users
- **platform_admin**: Can manage their assigned platform and its organizations/users
- **organization_admin**: Can manage their organization and its users
- **user**: Basic user with access to their own data only

## API Permission Matrix

```typescript
API_PERMISSIONS = {
  '/api/superadmin': ['super_admin'],
  '/api/platform-admin': ['super_admin', 'platform_admin'],
  '/api/org': ['super_admin', 'platform_admin', 'organization_admin'],
  '/api/user': ['super_admin', 'platform_admin', 'organization_admin', 'user'],
  '/api/admin': ['super_admin'],
  '/api/auth': [], // Public endpoints
  '/api/upload': ['super_admin', 'platform_admin', 'organization_admin', 'user']
}
```

## Authorization Functions

### Core Functions

1. **requireAuth(event)**: Validates authentication, throws 401 if not authenticated
2. **requireRole(event, allowedRoles)**: Validates user has one of the allowed roles
3. **requireApiAccess(event)**: Automatic API access control based on route path
4. **requireOrganizationAccess(event, targetOrgId?)**: Organization-specific access control
5. **requirePlatformAccess(event, targetPlatformId?)**: Platform-specific access control

### Usage Examples

```typescript
// Basic role check
const user = await requireRole(event, ['super_admin', 'platform_admin']);

// Organization access (org admins can only access their org)
const user = await requireOrganizationAccess(event, targetOrgId);

// Platform access (platform admins can only access their platform)
const user = await requirePlatformAccess(event, targetPlatformId);

// Simple authentication check
const user = await requireAuth(event);
```

## Implementation Status

### Updated Endpoints

✅ **server/api/superadmin/platforms.ts**
- Uses `requireRole(event, ['super_admin'])`
- Only super admins can manage platforms

✅ **server/api/platform-admin/platforms.ts**
- Uses `requirePlatformAccess(event)`
- Platform admins can only manage their assigned platform

✅ **server/api/org/users/create.post.ts**
- Uses `requireOrganizationAccess(event)`
- Organization admins can only create users in their organization

✅ **server/api/admin/document-types.get.ts**
- Uses `requireRole(event, ['super_admin', 'platform_admin', 'organization_admin'])`
- All admin roles can view document types

✅ **server/api/user/me.get.ts**
- Uses `requireAuth(event)`
- All authenticated users can access their own profile

### Middleware

✅ **server/middleware/api-auth.ts**
- Global API authorization middleware
- Automatically applies access control based on route patterns
- Skips public endpoints like `/api/auth/`

## Security Features

### Context-Aware Authorization

1. **Organization Isolation**: Organization admins cannot access other organizations
2. **Platform Isolation**: Platform admins cannot access other platforms
3. **Role Hierarchy**: Higher roles inherit lower role permissions
4. **Automatic Route Protection**: Middleware applies base-level protection

### Error Handling

- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions for the requested resource
- Consistent error messages across all endpoints

## Migration Guidelines

### For Existing Endpoints

Replace old authentication patterns:

```typescript
// OLD PATTERN
const user = await getUserFromEvent(event);
if (!user || !['admin', 'super_admin'].includes(user.role)) {
  throw createError({ statusCode: 403, statusMessage: 'Access denied' });
}

// NEW PATTERN
const user = await requireRole(event, ['admin', 'super_admin']);
```

### For Organization-Specific Endpoints

```typescript
// OLD PATTERN
const user = await getUserFromEvent(event);
if (user.role === 'organization_admin' && user.organizationId !== targetOrgId) {
  throw createError({ statusCode: 403, statusMessage: 'Cannot access other organizations' });
}

// NEW PATTERN
const user = await requireOrganizationAccess(event, targetOrgId);
```

## Testing

### Test Cases to Implement

1. **Role Hierarchy Tests**
   - Verify super_admin can access platform_admin endpoints
   - Verify platform_admin can access organization_admin endpoints
   - Verify users cannot access admin endpoints

2. **Context Isolation Tests**
   - Organization admins cannot access other organizations
   - Platform admins cannot access other platforms
   - Users cannot access other users' data

3. **Middleware Tests**
   - Public endpoints remain accessible
   - Protected endpoints require authentication
   - Error responses are consistent

## Future Enhancements

1. **Permission Caching**: Cache user permissions for better performance
2. **Audit Logging**: Log all authorization decisions for security auditing
3. **Dynamic Permissions**: Support for custom permissions beyond roles
4. **Rate Limiting**: Implement rate limiting per role/user

## Troubleshooting

### Common Issues

1. **401 Errors**: Check if JWT token is valid and not expired
2. **403 Errors**: Verify user has required role in the permission matrix
3. **Middleware Conflicts**: Ensure endpoints don't override middleware decisions incorrectly

### Debug Tips

```typescript
// Add logging to debug authorization issues
console.log('User role:', user.role);
console.log('Required roles:', allowedRoles);
console.log('API path:', event.node.req.url);
```

---

This authorization system provides a robust foundation for securing the API while maintaining flexibility for future enhancements.