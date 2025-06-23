<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['platform_admin'],
});

const { data, error, pending } = await useFetch('/api/platform/settings/get', {
  credentials: 'include',
});
</script>

<template>
  <div class="max-w-3xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Platform Settings</h1>

    <div v-if="pending" class="text-gray-600">Loading settings...</div>
    <div v-else-if="error" class="text-red-600 font-semibold">Failed to load settings.</div>

    <div v-else>
      <pre class="bg-gray-100 p-4 rounded-xl text-sm overflow-auto">
        {{ JSON.stringify(data.settings, null, 2) }}
      </pre>
    </div>
  </div>
</template>
