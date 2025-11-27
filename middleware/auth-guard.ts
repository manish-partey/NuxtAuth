// middleware/auth-guard.ts - Consolidated authentication and authorization middleware
import { defineNuxtRouteMiddleware, navigateTo, createError } from '#app';
import { useAuthStore } from '~/stores/auth';
import { getCookie } from 'h3';
import type { OrgVerifyResponse } from '~/types/api';
import { apiGet } from '~/utils/api';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();

  // 1. SESSION VALIDATION - Ensure session cookie exists
  let sessionCookie;
  if (process.server) {
    // Server-side: Use `getCookie`
    const event = useNuxtApp().ssrContext?.event;
    if (event) {
      sessionCookie = getCookie(event, 'auth_token');
      console.log('[Auth Guard] Server-side session cookie:', sessionCookie ? 'Found' : 'Not found');
    } else {
      console.warn('[Auth Guard] Server-side event object is undefined.');
    }
  } else {
    // Client-side: Multiple methods to find the cookie
    console.log('[Auth Guard] All cookies:', typeof document !== 'undefined' ? document.cookie : 'No document');
    
    // Method 1: Direct document.cookie parsing
    if (typeof document !== 'undefined') {
      const cookieString = document.cookie;
      console.log('[Auth Guard] Cookie string:', cookieString);
      
      sessionCookie = cookieString
        .split('; ')
        .find((row) => row.startsWith('auth_token='))
        ?.split('=')[1];
      
      if (!sessionCookie) {
        // Try without semicolon space
        sessionCookie = cookieString
          .split(';')
          .find((row) => row.trim().startsWith('auth_token='))
          ?.split('=')[1];
      }
    }
    
    // Method 2: Use Nuxt's useCookie composable
    if (!sessionCookie) {
      try {
        const authCookie = useCookie('auth_token', { 
          default: () => null,
          httpOnly: false,
          secure: false,
          sameSite: 'lax'
        });
        sessionCookie = authCookie.value;
        console.log('[Auth Guard] useCookie result:', sessionCookie ? 'Found' : 'Not found');
      } catch (e) {
        console.warn('[Auth Guard] useCookie failed:', e);
      }
    }
    
    console.log('[Auth Guard] Client-side session cookie final result:', sessionCookie ? 'Found' : 'Not found');
  }

  // Add detailed logs for debugging
  console.log('[Auth Guard] Session cookie retrieval method:', process.server ? 'Server-side' : 'Client-side');
  console.log('[Auth Guard] Retrieved session cookie:', sessionCookie);

  if (!sessionCookie) {
    console.warn('[Auth Guard] Missing session cookie. Redirecting to login.');
    return navigateTo('/login?reason=missing_cookie');
  }

  console.log('[Auth Guard] Session cookie found:', sessionCookie);

  // 3. AUTHENTICATION - Ensure user is loaded and authenticated
  try {
    if (!authStore.user && !authStore.loading) {
      await authStore.fetchUser();
    }
    console.log('[Auth Guard] User data:', authStore.user);
  } catch (err) {
    console.warn('[Auth Guard] fetchUser failed:', err);
    return navigateTo('/login?reason=fetch_user_failed');
  }

  // Check if page is public (no auth required)
  const publicPages = ['/', '/login', '/register', '/forgot-password'];
  const isPublic = 
    publicPages.includes(to.path) ||
    to.path.startsWith('/verify-email') ||
    to.path.startsWith('/reset-password') ||
    to.path.startsWith('/accept-invite');

  // Redirect to login if not authenticated and not a public page
  if (!authStore.loggedIn && !isPublic) {
    console.warn('[Auth Guard] User not authenticated. Redirecting to login.');
    return navigateTo('/login?reason=not_authenticated');
  }

  // If not logged in but on public page, allow access
  if (!authStore.loggedIn && isPublic) {
    return;
  }

  // Role-based routing
  const userRole = authStore.user?.role;
  if (to.path === '/dashboard') {
    switch (userRole) {
      case 'user':
        return; // Stay on dashboard
      case 'super_admin':
        return navigateTo('/superadmin');
      case 'platform_admin':
        return navigateTo('/platform');
      case 'organization_admin':
        return navigateTo('/org');
      default:
        return navigateTo('/login?reason=invalid_role');
    }
  }

  // 5. ROLE AUTHORIZATION - Check if user has required permissions
  
  // Get allowed roles from page meta (supports both legacy 'roles' array and new 'requiredRole' string)
  const allowedRoles = to.meta?.roles as string[] | undefined;
  const requiredRole = to.meta?.requiredRole as string | undefined;
  
  // If no role restrictions, allow access
  if (!allowedRoles && !requiredRole) {
    return;
  }

  // Ensure user has a role
  if (!userRole) {
    return navigateTo('/login');
  }

  // Check single required role
  if (requiredRole && userRole !== requiredRole) {
    return redirectToAppropriateArea(userRole);
  }

  // Check against allowed roles array
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return redirectToAppropriateArea(userRole);
  }

  // 6. ORGANIZATION ADMIN SPECIAL VERIFICATION
  // If user is organization_admin, ensure they have organization access
  if (userRole === 'organization_admin' && to.path.startsWith('/org')) {
    if (!authStore.user?.organizationId) {
      try {
        const response = await apiGet<OrgVerifyResponse>('/api/org/users/verify-admin');
        
        if (!response.success || !response.hasOrgAccess) {
          throw createError({
            statusCode: 403,
            statusMessage: 'Not a member of any organization. Please contact support.'
          });
        }
      } catch (error) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Organization access verification failed. Please contact support.'
        });
      }
    }
  }
});

/**
 * Redirect user to their appropriate area based on role
 */
function redirectToAppropriateArea(userRole: string) {
  switch (userRole) {
    case 'super_admin':
      return navigateTo('/superadmin');
    case 'platform_admin':
      return navigateTo('/platform');
    case 'organization_admin':
      return navigateTo('/org');
    case 'user':
      return navigateTo('/dashboard');
    default:
      return navigateTo('/login');
  }
}