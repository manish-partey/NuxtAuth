// middleware/auth.ts
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();

  if (process.client && authStore.user === null && !authStore.loading) {
    await authStore.fetchUser();
  }

  const publicPages = ['/', '/login', '/register', '/forgot-password'];
  const isAuthRoute =
    publicPages.includes(to.path) ||
    to.path.startsWith('/verify-email') ||
    to.path.startsWith('/reset-password');

  if (!authStore.loggedIn && !isAuthRoute) {
    return navigateTo('/login');
  }

  const role = authStore.user?.role;

  if (to.path === '/dashboard') {
    switch (role) {
      case 'user':
        return; // allowed
      case 'super_admin':
        return navigateTo('/superadmin');
      case 'platform_admin':
        return navigateTo('/platform');
      case 'organization_admin':
        return navigateTo('/org');
      case 'admin':
        return navigateTo('/admin');
      default:
        return navigateTo('/login');
    }
  }

  // Meta role guard
  const allowedRoles = (to.meta?.roles as string[]) || [];
  if (allowedRoles.length && role && !allowedRoles.includes(role)) {
    return navigateTo('/login');
  }
});
