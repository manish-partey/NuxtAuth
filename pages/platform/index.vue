<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['platform_admin']
});
</script>

<template>
  <div class="max-w-6xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Platform Admin Dashboard</h1>

    <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink to="/platform/tenants" class="dashboard-card">
        <h2 class="text-xl font-semibold">Tenants</h2>
        <p class="text-sm text-gray-600">View and manage all organizations under your platform.</p>
      </NuxtLink>

      <NuxtLink to="/platform/admins" class="dashboard-card">
        <h2 class="text-xl font-semibold">Admins</h2>
        <p class="text-sm text-gray-600">Assign or remove organization admins within your platform.</p>
      </NuxtLink>

      <NuxtLink to="/platform/settings" class="dashboard-card">
        <h2 class="text-xl font-semibold">Settings</h2>
        <p class="text-sm text-gray-600">Configure platform-specific settings and preferences.</p>
      </NuxtLink>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
@layer components {
  .dashboard-card {
    @apply bg-white rounded-2xl shadow p-6 hover:bg-gray-50 transition;
  }
}
</style>
