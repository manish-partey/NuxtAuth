<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { callOnce } from '#app';

const authStore = useAuthStore();

await callOnce(async () => {
  try {
    await authStore.fetchUser();
  } catch (err) {
    // Likely 401 if not logged in — safe to ignore on first load
    console.warn('User not authenticated — continuing as guest.');
  }
});
</script>

