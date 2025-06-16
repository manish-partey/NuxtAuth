// middleware/role.ts
import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();
  const userRole = auth.user?.role;

  // Roles allowed for this route in route meta (e.g. meta: { roles: ['super_admin', 'platform_admin'] })
  const allowedRoles = to.meta.roles as string[] | undefined;

  if (!allowedRoles) {
    // No role restriction on this route
    return;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return navigateTo('/login');  // or a "not authorized" page
  }
});
