<template>
  <div class="max-w-5xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-semibold text-gray-800 mb-6">User Dashboard</h1>
    <p>Welcome to your dashboard. View your activities and updates here.</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['user', 'organization_admin', 'platform_admin'],
});
</script>
