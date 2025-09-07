// middleware/role.ts
import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();
  const userRole = auth.user?.role;

  // Check for roles array (legacy support)
  const allowedRoles = to.meta.roles as string[] | undefined;
  
  // Check for single required role
  const requiredRole = to.meta.requiredRole as string | undefined;

  // If neither is set, no role restriction
  if (!allowedRoles && !requiredRole) {
    return;
  }

  // Check if user is authenticated
  if (!userRole) {
    return navigateTo('/login');
  }

  // Check against required role (single role)
  if (requiredRole && userRole !== requiredRole) {
    return navigateTo('/dashboard'); // or a "not authorized" page
  }

  // Check against allowed roles array (multiple roles)
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return navigateTo('/dashboard'); // or a "not authorized" page
  }
});
