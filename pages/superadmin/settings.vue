<script setup lang="ts">
const { data: settings, error } = await useFetch('/api/superadmin/settings/get', {
  credentials: 'include',
  headers: useRequestHeaders(['cookie']),
});
</script>

<template>
  <div>
    <h1 class="text-xl font-bold mb-4">Platform Settings</h1>
    <div v-if="error" class="text-red-600">Error loading settings</div>
    <pre v-else>{{ settings }}</pre>
  </div>
</template>