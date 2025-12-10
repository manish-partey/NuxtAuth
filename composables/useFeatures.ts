import { ref, computed } from 'vue';

/**
 * Composable for checking feature availability
 * 
 * Usage:
 * const { isFeatureEnabled, features, loading } = useFeatures();
 * 
 * // Check if a feature is enabled
 * if (isFeatureEnabled('auditLogs')) {
 *   // Show audit logs component
 * }
 * 
 * // Or use in template
 * <template>
 *   <button v-if="isFeatureEnabled('passwordResetTrigger')">
 *     Send Password Reset
 *   </button>
 * </template>
 */

interface FeatureResponse {
  role: string | null;
  features: Record<string, any>;
  raw: {
    orgAdmin?: any;
    platformAdmin?: any;
    superAdmin?: any;
    general: any;
  };
}

const featuresData = ref<FeatureResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

export const useFeatures = () => {
  /**
   * Fetch features from the server
   */
  const fetchFeatures = async () => {
    if (featuresData.value) {
      // Already loaded
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<FeatureResponse>('/api/features');
      featuresData.value = response;
    } catch (err: any) {
      console.error('Failed to fetch features:', err);
      error.value = err.message || 'Failed to load features';
      // Set default empty state
      featuresData.value = {
        role: null,
        features: {},
        raw: { general: {} },
      };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Check if a specific feature is enabled
   * @param featureName - Name of the feature (e.g., 'auditLogs', 'passwordResetTrigger')
   */
  const isFeatureEnabled = (featureName: string): boolean => {
    if (!featuresData.value) {
      return false;
    }

    // Check in flattened features first
    if (featuresData.value.features[featureName] === true) {
      return true;
    }

    // Check in raw features for nested paths
    const role = featuresData.value.role;
    if (role === 'organization_admin' && featuresData.value.raw.orgAdmin) {
      return checkNestedFeature(featuresData.value.raw.orgAdmin, featureName);
    } else if (role === 'platform_admin' && featuresData.value.raw.platformAdmin) {
      return checkNestedFeature(featuresData.value.raw.platformAdmin, featureName);
    } else if (role === 'super_admin' && featuresData.value.raw.superAdmin) {
      return checkNestedFeature(featuresData.value.raw.superAdmin, featureName);
    }

    // Check general features
    return checkNestedFeature(featuresData.value.raw.general, featureName);
  };

  /**
   * Check nested feature object
   */
  const checkNestedFeature = (obj: any, featureName: string): boolean => {
    if (!obj) return false;

    // Direct property
    if (obj[featureName] === true) {
      return true;
    }

    // Check nested properties (e.g., settings.profile)
    const parts = featureName.split('.');
    let current = obj;
    for (const part of parts) {
      if (current[part] === undefined) {
        return false;
      }
      current = current[part];
    }

    return current === true;
  };

  /**
   * Get all raw features for current user
   */
  const getRawFeatures = computed(() => {
    return featuresData.value?.raw || null;
  });

  /**
   * Get current user role
   */
  const userRole = computed(() => {
    return featuresData.value?.role || null;
  });

  /**
   * Check if features are loaded
   */
  const isLoaded = computed(() => {
    return featuresData.value !== null;
  });

  /**
   * Reload features (useful after role changes)
   */
  const reloadFeatures = async () => {
    featuresData.value = null;
    await fetchFeatures();
  };

  // Auto-fetch on first use
  if (!featuresData.value && !loading.value) {
    fetchFeatures();
  }

  return {
    isFeatureEnabled,
    getRawFeatures,
    userRole,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    isLoaded,
    fetchFeatures,
    reloadFeatures,
  };
};
