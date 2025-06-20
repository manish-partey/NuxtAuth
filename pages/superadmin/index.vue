<script setup lang="ts">
definePageMeta({
  middleware: ['auth'] // ✅ Protects route with auth middleware
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Super Admin Dashboard</h1>
    <p>Welcome, Super Admin! Here you can manage platforms, users, and global settings.</p>
    <!-- If you add $fetch requests later, remember to use `credentials: 'include'` -->
  </div>
</template>
