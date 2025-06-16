<template>
  <div class="max-w-6xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Organization Dashboard</h1>

    <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink to="/org/users" class="dashboard-card">
        <h2 class="text-xl font-semibold">Users</h2>
        <p class="text-sm text-gray-600">View and manage all users in your organization.</p>
      </NuxtLink>

      <NuxtLink to="/org/invites" class="dashboard-card">
        <h2 class="text-xl font-semibold">Invitations</h2>
        <p class="text-sm text-gray-600">Send invites to new members and track their status.</p>
      </NuxtLink>

      <NuxtLink to="/org/settings">
        <h2 class="text-xl font-semibold">Settings</h2>
        <p class="text-sm text-gray-600">Update organization name and preferences.</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['org_admin'],
});
</script>

<!-- <style lang="postcss">
.dashboard-card {
  @apply bg-white rounded-2xl shadow p-6 hover:bg-gray-50 transition;

}
</style> -->