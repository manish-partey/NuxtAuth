<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { callOnce } from '#app'; // Only need callOnce as useNuxtApp is implicitly handled

// Use useAuthStore() directly. The @pinia/nuxt module ensures Pinia is active
// for SSR, so you don't need the `ref` workaround from earlier attempts.
const authStore = useAuthStore();

// Use callOnce to fetch initial user data on the server and hydrate it on the client.
// This is crucial for consistent state between server and client.
await callOnce(async () => {
  await authStore.fetchUser();
});

// Any onMounted calls for initial data fetching can be removed
// if callOnce handles it for both server and client.
</script>