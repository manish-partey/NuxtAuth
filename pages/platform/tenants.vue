<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Tenant Management</h1>
    <p>List and manage all tenant organizations registered under this platform.</p>
    <!-- Add tenant list/table later -->
  </div>
</template>
