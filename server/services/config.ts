// server/services/config.ts
import SystemConfig from '../models/SystemConfig';

export async function getConfig(key: string, defaultValue: any = null) {
  try {
    const config = await SystemConfig.findOne({ key });
    return config?.value ?? defaultValue;
  } catch (error) {
    console.error(`[Config Service] Error getting config ${key}:`, error);
    return defaultValue;
  }
}

export async function setConfig(
  key: string,
  value: any,
  userId: string,
  description?: string,
  category?: string
) {
  try {
    return await SystemConfig.findOneAndUpdate(
      { key },
      {
        value,
        updatedBy: userId,
        ...(description && { description }),
        ...(category && { category }),
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error(`[Config Service] Error setting config ${key}:`, error);
    throw error;
  }
}

export async function getOrgTypeManagementMode(): Promise<'centralized' | 'decentralized'> {
  return await getConfig('org_type_management_mode', 'decentralized');
}

export async function isOrgTypeApprovalRequired(): Promise<boolean> {
  return await getConfig('org_type_approval_required', true);
}

export async function allowCustomTypesPerPlatform(): Promise<boolean> {
  return await getConfig('org_type_allow_custom_per_platform', true);
}

export async function getOrgTypeRateLimit(): Promise<number> {
  return await getConfig('org_type_rate_limit_per_day', 5);
}

export async function getAutoApprovalThreshold(): Promise<number> {
  return await getConfig('org_type_auto_approve_threshold', 3);
}

export async function getReviewPeriodDays(): Promise<number> {
  return await getConfig('org_type_review_period_days', 90);
}

// Initialize default configs
export async function initializeDefaultConfigs() {
  const defaults = [
    {
      key: 'org_type_management_mode',
      value: 'decentralized',
      description: 'Organization type management mode',
      category: 'organization',
    },
    {
      key: 'org_type_approval_required',
      value: true,
      description: 'Require super admin approval for platform-created types',
      category: 'organization',
    },
    {
      key: 'org_type_allow_custom_per_platform',
      value: true,
      description: 'Allow platform-specific custom types',
      category: 'organization',
    },
    {
      key: 'org_type_rate_limit_per_day',
      value: 5,
      description: 'Maximum org types a user can create per day',
      category: 'organization',
    },
    {
      key: 'org_type_auto_approve_threshold',
      value: 3,
      description: 'Auto-approve after this many similar requests from different platforms',
      category: 'organization',
    },
    {
      key: 'org_type_review_period_days',
      value: 90,
      description: 'Review custom types after this many days',
      category: 'organization',
    },
  ];

  for (const config of defaults) {
    await SystemConfig.findOneAndUpdate(
      { key: config.key },
      config,
      { upsert: true }
    );
  }

  console.log('[Config Service] Default configs initialized');
}
