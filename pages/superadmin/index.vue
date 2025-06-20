<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Super Admin Dashboard</h1>
    <p>Welcome, Super Admin! Here you can manage platforms, users, and global settings.</p>
  </div>
</template>
