import { useAuthStore } from '~/stores/auth';

export default defineNuxtPlugin(async () => {
  const auth = useAuthStore();
  if (!auth.loggedIn && !auth.loading) {
    await auth.fetchUser();
  }
});
