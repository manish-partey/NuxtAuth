// server/api/organization-types/search.get.ts
// #4 - Search & Filtering for Better UX
import { defineEventHandler, getQuery } from 'h3';
import OrganizationType from '~/server/models/OrganizationType';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { q, platformId, category, scope, limit = '20' } = query;
  
  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    return {
      success: true,
      organizationTypes: [],
      query: q
    };
  }
  
  const searchQuery = q.trim();
  const maxResults = Math.min(parseInt(limit as string) || 20, 100);
  
  // Build filter
  let filter: any = {
    status: 'active',
    active: true,
    $or: [
      { code: { $regex: searchQuery, $options: 'i' } },
      { name: { $regex: searchQuery, $options: 'i' } },
      { description: { $regex: searchQuery, $options: 'i' } }
    ]
  };
  
  if (category) {
    filter.category = category;
  }
  
  if (scope) {
    filter.scope = scope;
  }
  
  if (platformId) {
    // Include global types + platform-specific types
    filter.$and = [
      filter.$or ? { $or: filter.$or } : {},
      {
        $or: [
          { scope: 'global' },
          { scope: 'platform', platformId }
        ]
      }
    ];
    delete filter.$or;
  }
  
  const types = await OrganizationType.find(filter)
    .limit(maxResults)
    .sort({ usageCount: -1, name: 1 }) // Sort by popularity
    .select('code name description icon category scope usageCount')
    .lean();
  
  return {
    success: true,
    organizationTypes: types,
    query: searchQuery,
    count: types.length
  };
});
