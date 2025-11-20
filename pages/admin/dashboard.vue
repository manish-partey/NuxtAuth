<template>
  <div class="max-w-5xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-semibold text-gray-800 mb-6">Admin Dashboard</h1>
    <p>Welcome to the admin dashboard. Manage your platforms and users here.</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth-guard'],
  roles: ['platform_admin', 'organization_admin'],
});
</script>
