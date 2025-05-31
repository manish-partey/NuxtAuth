<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useNuxtApp, callOnce } from '#app';
import { ref } from 'vue'; // Import ref

// Declare authStore using ref, initially null or undefined
const authStore = ref<ReturnType<typeof useAuthStore> | null>(null);

// Use useAsyncData to fetch initial user data and initialize the store instance
// This ensures that the store is accessed and populated within the Nuxt/Pinia SSR context.
await callOnce(async () => {
  // IMPORTANT: Instantiate the store *inside* the async context
  authStore.value = useAuthStore();
  await authStore.value.fetchUser();
});

// Now, any components that rely on authStore will wait for it to be populated during SSR.
// You might need to use `authStore.value` in your templates and other script blocks.

// No changes to Navbar.vue or other files if the above fixes app.vue.
</script>