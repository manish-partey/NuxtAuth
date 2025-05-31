// middleware/admin.ts
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();

  if (process.client && authStore.user === null && !authStore.loading) {
    await authStore.fetchUser();
  }

  if (!authStore.isAdmin()) {
    // Redirect to a forbidden page or home page
    return navigateTo('/'); // Or '/forbidden'
  }
});