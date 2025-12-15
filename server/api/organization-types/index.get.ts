// server/api/organization-types/index.get.ts
import { defineEventHandler, getQuery } from 'h3';
import OrganizationType from '~/server/models/OrganizationType';
import Platform from '~/server/models/Platform';
import { allowCustomTypesPerPlatform } from '~/server/services/config';
import { cache, getCacheKey } from '~/server/utils/cache';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { platformId, category, includeInactive, scope } = query;
  
  // #1 - Check cache first (5 minute TTL)
  const cacheKey = getCacheKey('org-types', platformId, category, includeInactive, scope);
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  const allowCustom = await allowCustomTypesPerPlatform();
  
  let filter: any = {};
  
  // Only set status filter if not explicitly including inactive
  if (includeInactive !== 'true') {
    filter.status = 'active';
  }
  
  // Only apply category filter if explicitly passed in query
  if (category) {
    filter.category = category;
  }
  
  // Handle scope filter - 'all' means no scope restriction (super admin access)
  if (scope && scope !== 'all') {
    filter.scope = scope;
  }
  // If scope='all', don't add any scope filter - return all types regardless of scope
  
  if (platformId && scope !== 'all') {
    // #5 - Hybrid Approach: Auto-filter by category OR use manual override
    const platform = await Platform.findById(platformId);
    
    if (!platform) {
      return { success: false, error: 'Platform not found' };
    }
    
    const hasManualRestrictions = platform.allowedOrganizationTypes && platform.allowedOrganizationTypes.length > 0;
    
    if (hasManualRestrictions) {
      // Manual override: Platform has specific allowed types - filter by them
      if (allowCustom) {
        // Include platform-specific types AND allowed global types
        filter.$or = [
          { _id: { $in: platform.allowedOrganizationTypes } },
          { scope: 'platform', platformId }
        ];
      } else {
        // Only allowed global types
        filter._id = { $in: platform.allowedOrganizationTypes };
      }
    } else {
      // Auto-filter: Match by platform category (smart default)
      if (platform.category) {
        // Filter by matching category (including 'other')
        if (allowCustom) {
          filter.$or = [
            { category: platform.category, scope: 'global' },
            { scope: 'platform', platformId }
          ];
        } else {
          filter.category = platform.category;
          filter.scope = 'global';
        }
      } else {
        // No category set - show all global types
        if (allowCustom) {
          filter.$or = [
            { scope: 'global' },
            { scope: 'platform', platformId }
          ];
        } else {
          filter.scope = 'global';
        }
      }
    }
  } else if (!scope || scope === 'global') {
    // No platform specified and no scope filter, return only global types
    filter.scope = 'global';
  }
  // If scope='all' and no platformId, no scope filter is applied - returns all types
  
  console.log('OrganizationType Filter:', JSON.stringify(filter, null, 2));
  
  const types = await OrganizationType.find(filter)
    .sort({ displayOrder: 1, name: 1 })
    .populate('createdBy', 'name email')
    .populate('platformId', 'name')
    .lean();
  
  console.log('Found types:', types.length);
  
  const response = {
    success: true,
    organizationTypes: types
  };
  
  // Cache the response for 5 minutes
  cache.set(cacheKey, response, 300);
  
  return response;
});
