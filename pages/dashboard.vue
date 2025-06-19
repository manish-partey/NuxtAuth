<!-- pages/dashboard.vue -->
<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold text-blue-600">Welcome to Your Dashboard</h1>
    <p class="mt-4 text-gray-600">
      You are successfully logged in. Use the sidebar or navigation to explore the platform.
    </p>
  </div>
</template>

<script setup lang="ts">
// Optional: Fetch current user if not already in store
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
await auth.fetchUser()
</script>
