// plugins/pinia.ts
import { defineNuxtPlugin } from '#app';
import { createPinia } from 'pinia'; // Ensure this is imported

export default defineNuxtPlugin((nuxtApp) => {
  if (!nuxtApp.$pinia) {
    const pinia = createPinia();
    nuxtApp.vueApp.use(pinia);
    nuxtApp.$pinia = pinia;
  }
  // This line is crucial for setting the active Pinia store for the current SSR context
  nuxtApp.$pinia.use(() => ({ /* You can add store plugins here if needed */ }));

  // If you are calling fetchUser in app.vue, you don't need it here.
  // const authStore = useAuthStore();
  // await authStore.fetchUser();
});