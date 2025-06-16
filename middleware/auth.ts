// middleware/auth.ts
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();

  // On client, if user data not loaded, fetch it (e.g. on page refresh)
  if (process.client && authStore.user === null && !authStore.loading) {
    await authStore.fetchUser();
  }

  // Define all routes that should be accessible without login
  const publicPages = ['/', '/login', '/register', '/forgot-password'];
  const isAuthRoute =
    publicPages.includes(to.path) ||
    to.path.startsWith('/verify-email') ||
    to.path.startsWith('/reset-password');

  // Redirect unauthenticated users
  if (!authStore.loggedIn && !isAuthRoute) {
    return navigateTo('/login');
  }

  // Optional: Hook for future route-level role enforcement
  const allowedRoles = (to.meta?.roles as string[]) || [];
  const userRole = authStore.user?.role;

  if (allowedRoles.length && userRole && !allowedRoles.includes(userRole)) {
    return navigateTo('/dashboard'); // or show a 403 page
  }
});
