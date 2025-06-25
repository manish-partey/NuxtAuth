<template>
  <div class="max-w-3xl mx-auto py-10 px-6">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">Platform Settings</h1>

    <div v-if="pending">Loading settings...</div>
    <div v-else-if="error" class="text-red-600">Failed to load settings.</div>
    <div v-else>
      <form class="space-y-4" @submit.prevent="saveSettings">
        <div>
          <label class="block font-medium text-gray-700">Max Platforms</label>
          <input type="number" v-model="settings.maxPlatforms" class="mt-1 block w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label class="block font-medium text-gray-700">Max Orgs per Platform</label>
          <input type="number" v-model="settings.maxOrganizationsPerPlatform" class="mt-1 block w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label class="block font-medium text-gray-700">Enable Self Registration</label>
          <input type="checkbox" v-model="settings.enableSelfRegistration" class="mt-1" />
        </div>

        <div>
          <label class="block font-medium text-gray-700">Default User Role</label>
          <select v-model="settings.defaultUserRole" class="mt-1 block w-full border rounded px-3 py-2">
            <option value="user">User</option>
            <option value="organization_admin">Organization Admin</option>
          </select>
        </div>

        <div>
          <label class="block font-medium text-gray-700">Maintenance Mode</label>
          <input type="checkbox" v-model="settings.maintenanceMode" class="mt-1" />
        </div>

        <button
          type="submit"
          class="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Settings
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data, error, pending } = await useFetch('/api/settings');
const settings = ref(data.value?.settings || {});

const saveSettings = async () => {
  try {
    const response = await $fetch('/api/settings', {
      method: 'POST',
      body: settings.value
    });
    alert('Settings updated successfully');
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to update settings');
  }
};
</script>
