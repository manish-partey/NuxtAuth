// middleware/admin.ts
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();

  // Fetch user if not available
  if (!authStore.user && !authStore.loading) {
    try {
      await authStore.fetchUser();
    } catch {
      return navigateTo('/login'); // fallback if fetch fails
    }
  }

  // If still no user or not admin, redirect
  if (!authStore.isAdmin()) {
    return navigateTo('/'); // or '/forbidden'
  }
});
