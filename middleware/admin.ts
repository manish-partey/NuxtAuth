// middleware/admin.ts
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();

  // Ensure user is fetched on client-side when refreshed
  if (process.client && authStore.user === null && !authStore.loading) {
    try {
      await authStore.fetchUser();
    } catch {
      return navigateTo('/login');
    }
  }

  // If not logged in, redirect to login
  if (!authStore.loggedIn) {
    return navigateTo('/login');
  }

  // Check if user is not admin
  if (authStore.user?.role !== 'admin') {
    return navigateTo('/dashboard'); // or '/unauthorized'
  }
});
