// middleware/auth-guard.ts - Consolidated authentication and authorization middleware
import { defineNuxtRouteMiddleware, navigateTo, createError } from '#app'
import { useAuthStore } from '~/stores/auth'
import type { OrgVerifyResponse } from '~/types/api'
import { apiGet } from '~/utils/api'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  // 1. AUTHENTICATION - Ensure user is loaded and authenticated
  try {
    if (!authStore.user && !authStore.loading) {
      await authStore.fetchUser()
    }
  } catch (err) {
    console.warn('[Auth Guard] fetchUser failed:', err)
  }

  // Check if page is public (no auth required)
  const publicPages = ['/', '/login', '/register', '/forgot-password']
  const isPublic = 
    publicPages.includes(to.path) ||
    to.path.startsWith('/verify-email') ||
    to.path.startsWith('/reset-password') ||
    to.path.startsWith('/accept-invite')

  // Redirect to login if not authenticated and not a public page
  if (!authStore.loggedIn && !isPublic) {
    return navigateTo('/login')
  }

  // If not logged in but on public page, allow access
  if (!authStore.loggedIn && isPublic) {
    return
  }

  const userRole = authStore.user?.role

  // 2. ROLE-BASED ROUTING - Handle dashboard redirects based on role
  if (to.path === '/dashboard') {
    switch (userRole) {
      case 'user':
        return // Stay on dashboard
      case 'super_admin':
        return navigateTo('/superadmin')
      case 'platform_admin':
        return navigateTo('/platform')
      case 'organization_admin':
        return navigateTo('/org')
      default:
        return navigateTo('/login')
    }
  }

  // 3. ROLE AUTHORIZATION - Check if user has required permissions
  
  // Get allowed roles from page meta (supports both legacy 'roles' array and new 'requiredRole' string)
  const allowedRoles = to.meta?.roles as string[] | undefined
  const requiredRole = to.meta?.requiredRole as string | undefined
  
  // If no role restrictions, allow access
  if (!allowedRoles && !requiredRole) {
    return
  }

  // Ensure user has a role
  if (!userRole) {
    return navigateTo('/login')
  }

  // Check single required role
  if (requiredRole && userRole !== requiredRole) {
    return redirectToAppropriateArea(userRole)
  }

  // Check against allowed roles array
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return redirectToAppropriateArea(userRole)
  }

  // 4. ORGANIZATION ADMIN SPECIAL VERIFICATION
  // If user is organization_admin, ensure they have organization access
  if (userRole === 'organization_admin' && to.path.startsWith('/org')) {
    if (!authStore.user?.organizationId) {
      try {
        const response = await apiGet<OrgVerifyResponse>('/api/org/users/verify-admin')
        
        if (!response.success || !response.hasOrgAccess) {
          throw createError({
            statusCode: 403,
            statusMessage: 'Not a member of any organization. Please contact support.'
          })
        }
      } catch (error) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Organization access verification failed. Please contact support.'
        })
      }
    }
  }
})

/**
 * Redirect user to their appropriate area based on role
 */
function redirectToAppropriateArea(userRole: string) {
  switch (userRole) {
    case 'super_admin':
      return navigateTo('/superadmin')
    case 'platform_admin':
      return navigateTo('/platform')
    case 'organization_admin':
      return navigateTo('/org')
    case 'user':
      return navigateTo('/dashboard')
    default:
      return navigateTo('/login')
  }
}