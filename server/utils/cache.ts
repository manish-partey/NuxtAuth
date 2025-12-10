// server/utils/cache.ts
// #1 - Simple in-memory cache for performance boost
// For production, consider using Redis

interface CacheEntry {
  data: any;
  expiresAt: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry> = new Map();
  
  set(key: string, data: any, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expiresAt });
  }
  
  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  // Invalidate all keys matching a pattern
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
  
  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
export const cache = new SimpleCache();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);

// Helper function to generate cache keys
export function getCacheKey(prefix: string, ...args: any[]): string {
  return `${prefix}:${args.filter(a => a !== null && a !== undefined).join(':')}`;
}

// Helper to invalidate org type caches
export function invalidateOrgTypeCache(platformId?: string): void {
  if (platformId) {
    cache.invalidatePattern(`org-types:.*:${platformId}`);
  }
  cache.invalidatePattern('org-types:.*');
}
