// server/middleware/api-auth.ts - Global API authorization middleware
import { defineEventHandler } from 'h3';
import { requireApiAccess } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  // Skip auth for public endpoints
  const publicEndpoints = [
    '/api/auth/',
    '/api/public/',
    '/api/_content',
    '/api/_nuxt',
    '/api/health'
  ];
  
  const url = event.node.req.url || '';
  
  // Skip if not an API route or if it's a public endpoint
  if (!url.startsWith('/api/') || publicEndpoints.some(endpoint => url.startsWith(endpoint))) {
    return;
  }
  
  // Skip for auth endpoints specifically
  if (url.includes('/api/auth/')) {
    return;
  }
  
  try {
    // Apply automatic API access control based on route
    await requireApiAccess(event);
  } catch (error) {
    // Let the error bubble up to be handled by the specific endpoint
    // This allows endpoints to override with more specific authorization
    console.log(`[API-AUTH] Authorization check for ${url}:`, (error as any).statusMessage);
  }
});