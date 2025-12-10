# Feature Flags System

This document explains how to configure and use feature flags in the application.

## Overview

The feature flags system allows you to enable/disable specific features across the application without code changes. This is useful for:

- **Gradual rollouts**: Enable features for specific environments
- **A/B testing**: Test features with subset of users
- **Production control**: Quickly disable problematic features
- **Customization**: Tailor features per deployment/client

## Architecture

### Backend (Server)

1. **Configuration**: `server/config/features.ts`
   - Defines all feature flags with TypeScript types
   - Reads from environment variables
   - Provides default values

2. **Feature Guard**: `server/utils/feature-guard.ts`
   - `requireFeature()` - Throws 403 if feature disabled
   - `isFeatureEnabled()` - Check if feature is enabled
   - `getEnabledFeaturesForRole()` - Get all enabled features for a role

3. **API Endpoint**: `server/api/features.get.ts`
   - Exposes enabled features to frontend based on user role
   - Returns role-specific features + general features

### Frontend (Client)

1. **Composable**: `composables/useFeatures.ts`
   - `isFeatureEnabled(featureName)` - Check if feature is enabled
   - Auto-fetches features on first use
   - Caches results for performance

## Usage

### Backend - Protecting API Endpoints

Add feature checks to your API endpoints:

```typescript
import { requireFeature } from '~/server/utils/feature-guard';

export default defineEventHandler(async (event) => {
  // Check if feature is enabled (throws 403 if disabled)
  requireFeature(event, 'orgAdmin.auditLogs', 'Audit logs are not enabled');
  
  // Your endpoint logic here
  const currentUser = await requireOrganizationAccess(event);
  // ...
});
```

### Frontend - Conditional UI

Use the `useFeatures` composable in your Vue components:

```vue
<script setup lang="ts">
const { isFeatureEnabled } = useFeatures();
</script>

<template>
  <div>
    <!-- Only show if feature is enabled -->
    <button v-if="isFeatureEnabled('passwordResetTrigger')">
      Send Password Reset
    </button>
    
    <!-- Conditional navigation -->
    <nav>
      <NuxtLink v-if="isFeatureEnabled('auditLogs')" to="/org/audit-logs">
        Audit Logs
      </NuxtLink>
      <NuxtLink v-if="isFeatureEnabled('settings.profile')" to="/org/settings/profile">
        Profile Settings
      </NuxtLink>
    </nav>
  </div>
</template>
```

### Programmatic Checks

```typescript
import { useFeatures } from '~/composables/useFeatures';

const { isFeatureEnabled, getRawFeatures, userRole } = useFeatures();

// Check single feature
if (isFeatureEnabled('auditLogs')) {
  console.log('Audit logs are enabled');
}

// Check nested feature
if (isFeatureEnabled('settings.profile')) {
  console.log('Profile settings are enabled');
}

// Get all raw features
const features = getRawFeatures.value;
console.log('All features:', features);

// Get user role
console.log('User role:', userRole.value);
```

## Configuration

### Environment Variables

Set feature flags in your `.env` file:

```bash
# Disable audit logs
FEATURE_ORG_AUDIT_LOGS=false

# Disable password reset trigger
FEATURE_ORG_PASSWORD_RESET=false

# Disable entire settings section
FEATURE_ORG_SETTINGS_PROFILE=false
FEATURE_ORG_SETTINGS_PASSWORD=false
FEATURE_ORG_SETTINGS_ORG=false

# Enable 2FA (disabled by default)
FEATURE_TWO_FACTOR=true
```

### Default Values

All features are **enabled by default** except:
- `FEATURE_TWO_FACTOR=false` (future feature)

To disable a feature, explicitly set it to `false` in your environment variables.

## Available Features

### Organization Admin Features (`orgAdmin`)

| Feature | Flag | Description |
|---------|------|-------------|
| Audit Logs | `FEATURE_ORG_AUDIT_LOGS` | View audit logs |
| Password Reset Trigger | `FEATURE_ORG_PASSWORD_RESET` | Trigger password resets |
| Organization Details | `FEATURE_ORG_DETAILS` | View organization info |
| Edit Organization | `FEATURE_ORG_EDIT` | Edit organization metadata |
| User Management | `FEATURE_ORG_USER_MGMT` | Full user CRUD |
| Document Management | `FEATURE_ORG_DOC_MGMT` | Manage documents |
| Invite Users | `FEATURE_ORG_INVITE` | Invite new users |
| Profile Settings | `FEATURE_ORG_SETTINGS_PROFILE` | User profile management |
| Password Settings | `FEATURE_ORG_SETTINGS_PASSWORD` | Password change |
| Organization Settings | `FEATURE_ORG_SETTINGS_ORG` | Org-level settings |

### Platform Admin Features (`platformAdmin`)

| Feature | Flag | Description |
|---------|------|-------------|
| Organization Approval | `FEATURE_PLATFORM_ORG_APPROVAL` | Approve/reject orgs |
| Platform Settings | `FEATURE_PLATFORM_SETTINGS` | Manage platform |
| Document Requirements | `FEATURE_PLATFORM_DOC_REQS` | Set doc requirements |
| Analytics | `FEATURE_PLATFORM_ANALYTICS` | View analytics |

### Super Admin Features (`superAdmin`)

| Feature | Flag | Description |
|---------|------|-------------|
| Platform Management | `FEATURE_SUPER_PLATFORM_MGMT` | Full platform CRUD |
| System Audit Logs | `FEATURE_SUPER_AUDIT_LOGS` | System-wide logs |
| User Impersonation | `FEATURE_SUPER_IMPERSONATE` | Impersonate users |
| System Settings | `FEATURE_SUPER_SETTINGS` | Global settings |

### General Features (`general`)

| Feature | Flag | Description |
|---------|------|-------------|
| Email Verification | `FEATURE_EMAIL_VERIFICATION` | Require email verification |
| Two-Factor Auth | `FEATURE_TWO_FACTOR` | Enable 2FA |
| Subscription Management | `FEATURE_SUBSCRIPTIONS` | Subscription features |
| Notifications | `FEATURE_NOTIFICATIONS` | In-app notifications |

## Best Practices

### 1. Always Use Feature Guards on APIs

```typescript
// ✅ Good - Protected endpoint
export default defineEventHandler(async (event) => {
  requireFeature(event, 'orgAdmin.auditLogs');
  // endpoint logic
});

// ❌ Bad - Unprotected endpoint
export default defineEventHandler(async (event) => {
  // endpoint logic without check
});
```

### 2. Hide UI Elements When Features Are Disabled

```vue
<!-- ✅ Good - Conditional rendering -->
<button v-if="isFeatureEnabled('passwordResetTrigger')">
  Send Reset
</button>

<!-- ❌ Bad - Always visible -->
<button>Send Reset</button>
```

### 3. Provide User Feedback

```typescript
try {
  await $fetch('/api/org/trigger-reset', { method: 'POST' });
} catch (error) {
  if (error.statusCode === 403) {
    // Feature is disabled
    alert('This feature is not available');
  }
}
```

### 4. Test Feature Toggles

Test your application with features both enabled and disabled to ensure graceful degradation.

## Example Scenarios

### Scenario 1: Disable Audit Logs in Development

`.env.development`
```bash
FEATURE_ORG_AUDIT_LOGS=false
```

### Scenario 2: Enable 2FA in Production Only

`.env.production`
```bash
FEATURE_TWO_FACTOR=true
```

### Scenario 3: Disable Password Reset for Specific Client

`.env`
```bash
FEATURE_ORG_PASSWORD_RESET=false
```

### Scenario 4: Enable Only Basic Features

```bash
# Enable only user management and invites
FEATURE_ORG_USER_MGMT=true
FEATURE_ORG_INVITE=true

# Disable everything else
FEATURE_ORG_AUDIT_LOGS=false
FEATURE_ORG_PASSWORD_RESET=false
FEATURE_ORG_DETAILS=false
FEATURE_ORG_EDIT=false
FEATURE_ORG_DOC_MGMT=false
FEATURE_ORG_SETTINGS_PROFILE=false
FEATURE_ORG_SETTINGS_PASSWORD=false
FEATURE_ORG_SETTINGS_ORG=false
```

## Troubleshooting

### Feature Not Working After Enabling

1. **Restart the server** - Environment variables are loaded at startup
2. **Check .env file** - Ensure variable is set correctly
3. **Clear cache** - Frontend composable caches features, reload page

### Getting 403 Errors

If you get 403 errors when accessing endpoints:

1. Check if feature is enabled in `.env`
2. Verify environment variable name matches `server/config/features.ts`
3. Check server logs for feature check failures

### UI Not Updating

If UI doesn't reflect feature changes:

```typescript
// Force reload features
const { reloadFeatures } = useFeatures();
await reloadFeatures();
```

## Future Enhancements

Potential improvements to the feature flags system:

1. **Dynamic Toggle** - Admin UI to toggle features without restart
2. **User-Level Flags** - Enable features for specific users
3. **Organization-Level Flags** - Different features per organization
4. **Analytics** - Track feature usage and adoption
5. **Rollout Percentage** - Gradual rollout to percentage of users

## Questions?

For questions or issues with feature flags, contact the development team.
