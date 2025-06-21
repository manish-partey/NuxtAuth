// middleware/auth.ts
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();

  // ✅ Prevent SSR crashes when no cookie is available
  try {
    if (!authStore.user && !authStore.loading) {
      await authStore.fetchUser();
    }
  } catch (err) {
    console.warn('[Auth Middleware] fetchUser failed:', err);
    if (process.server) return; // SSR-safe: do nothing
  }

  const publicPages = ['/', '/login', '/register', '/forgot-password'];
  const isPublic =
    publicPages.includes(to.path) ||
    to.path.startsWith('/verify-email') ||
    to.path.startsWith('/reset-password');

  // ✅ Redirect only on client side when not logged in
  if (!authStore.loggedIn && !isPublic) {
    if (process.server) return;
    return navigateTo('/login');
  }

  const role = authStore.user?.role;

  // ✅ Redirect based on role if visiting generic dashboard
  if (to.path === '/dashboard') {
    switch (role) {
      case 'user':
        return;
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

  // ✅ Meta role check
  const allowedRoles = (to.meta?.roles as string[]) || [];
  if (allowedRoles.length && role && !allowedRoles.includes(role)) {
    return navigateTo('/login');
  }
});
