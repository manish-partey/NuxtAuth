<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Platform Admin Dashboard</h1>
    <p>Welcome, Platform Admin! This is your overview panel for tenant management.</p>
  </div>
</template>
