<template>
  <div class="max-w-3xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-semibold text-gray-800 mb-6">User Profile</h1>
    <p>Manage your personal profile information here.</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['user', 'organization_admin', 'platform_admin'],
});
</script>
