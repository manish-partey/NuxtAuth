<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['super_admin'],
});
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Manage Users</h1>
    <p>List of all users across the platform.</p>
    <!-- Add user management table here -->
  </div>
</template>
