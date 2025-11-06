<!-- pages/org/dashboard.vue -->
<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Organization Dashboard</h1>
    <p class="text-gray-600">Welcome to your organization control panel. From here you can manage users, settings, and invitations.</p>
    <ul class="mt-6 space-y-2">
      <li><NuxtLink to="/org/users" class="text-blue-600 hover:underline">Manage Users</NuxtLink></li>
      <li><NuxtLink to="/org/invites" class="text-blue-600 hover:underline">Manage Invitations</NuxtLink></li>
      <li><NuxtLink to="/org/documents" class="text-blue-600 hover:underline">Manage Documents</NuxtLink></li>
      <li><NuxtLink to="/org/settings" class="text-blue-600 hover:underline">Organization Settings</NuxtLink></li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// Optional: Add any dashboard-specific logic here later
</script>
