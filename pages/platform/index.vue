<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['platform_admin']
});
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Platform Admin Dashboard</h1>
    <p>Welcome, Platform Admin! Here you can manage all organizations (tenants) under your platform.</p>

    <NuxtLink to="/platform/tenants" class="inline-block mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
      View & Manage Tenants
    </NuxtLink>
  </div>
</template>
