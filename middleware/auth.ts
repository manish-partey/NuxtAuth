// middleware/auth.ts
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();

  // If user data hasn't been fetched yet (e.g., on initial load or page refresh), fetch it.
  // This needs to be done on the client-side as cookies are usually client-only accessible
  // for the browser, and server-side logic handles cookie reading.
  if (process.client && authStore.user === null && !authStore.loading) {
    await authStore.fetchUser();
  }

  if (!authStore.loggedIn && to.path !== '/login' && to.path !== '/register' && to.path !== '/forgot-password' && !to.path.startsWith('/verify-email') && !to.path.startsWith('/reset-password')) {
    return navigateTo('/login');
  }
});