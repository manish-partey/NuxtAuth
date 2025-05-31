// plugins/pinia.ts
import { defineNuxtPlugin } from '#app';
// import { Pinia } from 'pinia'; // OLD
import type { Pinia } from 'pinia'; // NEW: Add 'type' keyword
import { createPinia } from 'pinia'; // This is a runtime value, so keep it as a regular import

export default defineNuxtPlugin((nuxtApp) => {
  // Type assertion for nuxtApp.$pinia
  const piniaInstance = nuxtApp.$pinia as Pinia;

  if (!piniaInstance) {
    console.warn("Pinia instance not found on nuxtApp. Make sure @pinia/nuxt is installed and configured.");
    // If you uncommented the fallback createPinia() and vueApp.use(), make sure
    // createPinia is imported as a regular import, not a type-only import.
    // Example (if needed, but ideally @pinia/nuxt handles this):
    // const newPinia = createPinia();
    // nuxtApp.vueApp.use(newPinia);
    // nuxtApp.$pinia = newPinia;
    return;
  }

  // This is the CRITICAL part for resolving 'getActivePinia()' errors during SSR
  piniaInstance.use(() => ({}));
});