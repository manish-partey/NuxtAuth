/**
 * Feature Flags Configuration
 * 
 * This file controls which features are enabled/disabled across the application.
 * Set environment variables to override defaults in production.
 */

export interface FeatureFlags {
  // Organization Admin Features
  orgAdmin: {
    auditLogs: boolean;           // View audit logs
    passwordResetTrigger: boolean; // Trigger password resets for users
    organizationDetails: boolean;  // View organization details
    editOrganization: boolean;     // Edit organization metadata
    userManagement: boolean;       // Full user CRUD operations
    documentManagement: boolean;   // Manage organization documents
    inviteUsers: boolean;          // Invite new users
    settings: {
      profile: boolean;            // User profile management
      password: boolean;           // Password change
      organizationSettings: boolean; // Organization-level settings
    };
  };

  // Platform Admin Features
  platformAdmin: {
    organizationApproval: boolean; // Approve/reject organizations
    platformSettings: boolean;     // Manage platform settings
    documentRequirements: boolean; // Set document requirements
    analytics: boolean;            // View platform analytics
  };

  // Super Admin Features
  superAdmin: {
    platformManagement: boolean;   // Full platform CRUD
    systemAuditLogs: boolean;      // System-wide audit logs
    userImpersonation: boolean;    // Impersonate users
    systemSettings: boolean;       // Global system settings
  };

  // General Features
  general: {
    emailVerification: boolean;    // Require email verification
    twoFactorAuth: boolean;        // Enable 2FA (future)
    subscriptionManagement: boolean; // Subscription features
    notifications: boolean;        // In-app notifications
  };
}

const defaultFeatures: FeatureFlags = {
  orgAdmin: {
    auditLogs: true,
    passwordResetTrigger: true,
    organizationDetails: true,
    editOrganization: true,
    userManagement: true,
    documentManagement: true,
    inviteUsers: true,
    settings: {
      profile: true,
      password: true,
      organizationSettings: true,
    },
  },

  platformAdmin: {
    organizationApproval: true,
    platformSettings: true,
    documentRequirements: true,
    analytics: true,
  },

  superAdmin: {
    platformManagement: true,
    systemAuditLogs: true,
    userImpersonation: true,
    systemSettings: true,
  },

  general: {
    emailVerification: true,
    twoFactorAuth: false,
    subscriptionManagement: true,
    notifications: true,
  },
};

/**
 * Get feature flags from environment variables or defaults
 */
export function getFeatureFlags(): FeatureFlags {
  const env = process.env;

  return {
    orgAdmin: {
      auditLogs: env.FEATURE_ORG_AUDIT_LOGS !== 'false',
      passwordResetTrigger: env.FEATURE_ORG_PASSWORD_RESET !== 'false',
      organizationDetails: env.FEATURE_ORG_DETAILS !== 'false',
      editOrganization: env.FEATURE_ORG_EDIT !== 'false',
      userManagement: env.FEATURE_ORG_USER_MGMT !== 'false',
      documentManagement: env.FEATURE_ORG_DOC_MGMT !== 'false',
      inviteUsers: env.FEATURE_ORG_INVITE !== 'false',
      settings: {
        profile: env.FEATURE_ORG_SETTINGS_PROFILE !== 'false',
        password: env.FEATURE_ORG_SETTINGS_PASSWORD !== 'false',
        organizationSettings: env.FEATURE_ORG_SETTINGS_ORG !== 'false',
      },
    },

    platformAdmin: {
      organizationApproval: env.FEATURE_PLATFORM_ORG_APPROVAL !== 'false',
      platformSettings: env.FEATURE_PLATFORM_SETTINGS !== 'false',
      documentRequirements: env.FEATURE_PLATFORM_DOC_REQS !== 'false',
      analytics: env.FEATURE_PLATFORM_ANALYTICS !== 'false',
    },

    superAdmin: {
      platformManagement: env.FEATURE_SUPER_PLATFORM_MGMT !== 'false',
      systemAuditLogs: env.FEATURE_SUPER_AUDIT_LOGS !== 'false',
      userImpersonation: env.FEATURE_SUPER_IMPERSONATE !== 'false',
      systemSettings: env.FEATURE_SUPER_SETTINGS !== 'false',
    },

    general: {
      emailVerification: env.FEATURE_EMAIL_VERIFICATION !== 'false',
      twoFactorAuth: env.FEATURE_TWO_FACTOR === 'true',
      subscriptionManagement: env.FEATURE_SUBSCRIPTIONS !== 'false',
      notifications: env.FEATURE_NOTIFICATIONS !== 'false',
    },
  };
}

// Export singleton instance
export const features = getFeatureFlags();
