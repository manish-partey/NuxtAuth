import { H3Event, createError } from 'h3';
import { features } from '../config/features';

/**
 * Feature Guard Utility
 * 
 * Checks if a feature is enabled before allowing access.
 * Throws 403 error if feature is disabled.
 */

export interface FeatureCheckOptions {
  feature: string;
  customMessage?: string;
}

/**
 * Check if a feature is enabled by path (e.g., 'orgAdmin.auditLogs')
 */
export function isFeatureEnabled(featurePath: string): boolean {
  const keys = featurePath.split('.');
  let current: any = features;

  for (const key of keys) {
    if (current[key] === undefined) {
      console.warn(`Feature path not found: ${featurePath}`);
      return false;
    }
    current = current[key];
  }

  return current === true;
}

/**
 * Middleware to check if a feature is enabled
 * Throws 403 error if disabled
 */
export function requireFeature(event: H3Event, featurePath: string, customMessage?: string) {
  if (!isFeatureEnabled(featurePath)) {
    throw createError({
      statusCode: 403,
      statusMessage: customMessage || `Feature "${featurePath}" is not enabled`,
    });
  }
}

/**
 * Get nested feature value by path
 */
export function getFeatureValue(featurePath: string): any {
  const keys = featurePath.split('.');
  let current: any = features;

  for (const key of keys) {
    if (current[key] === undefined) {
      return undefined;
    }
    current = current[key];
  }

  return current;
}

/**
 * Get all enabled features for a role category
 */
export function getEnabledFeaturesForRole(roleCategory: 'orgAdmin' | 'platformAdmin' | 'superAdmin' | 'general'): Record<string, boolean> {
  const roleFeatures = (features as any)[roleCategory];
  
  if (!roleFeatures) {
    return {};
  }

  const enabled: Record<string, boolean> = {};

  function flattenFeatures(obj: any, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'boolean') {
        if (value === true) {
          enabled[fullKey] = true;
        }
      } else if (typeof value === 'object') {
        flattenFeatures(value, fullKey);
      }
    }
  }

  flattenFeatures(roleFeatures);
  return enabled;
}
