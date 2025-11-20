<!-- pages/admin/settings.vue -->
<template>
  <div class="max-w-4xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-semibold text-gray-800 mb-6">Admin Settings</h1>

    <div class="bg-white rounded-xl shadow p-6 space-y-4">
      <p class="text-gray-700">Here you can configure platform-level settings (e.g., global toggles, feature flags, user limits, etc.).</p>

      <div class="text-sm text-gray-500 italic">🔧 Feature coming soon...</div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['auth-guard'],
  roles: ['platform_admin', 'super_admin']
});
</script>
