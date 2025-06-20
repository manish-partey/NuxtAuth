<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useFetch, useRuntimeConfig } from '#app';
import { useRouter } from 'vue-router';

definePageMeta({
  middleware: ['auth'],
  roles: ['super_admin']
});

const router = useRouter();
const loading = ref(false);
const error = ref('');
const success = ref('');

const globalSettings = reactive({
  maxPlatforms: 10,            // max number of platforms (tenants) allowed
  maxOrganizationsPerPlatform: 100, // max orgs per platform
  enableSelfRegistration: false,     // allow org self registration
  defaultUserRole: 'user',     // default role assigned on org user creation
  maintenanceMode: false       // enable/disable system-wide maintenance mode
});

// Fetch current settings from backend API on mount
onMounted(async () => {
  loading.value = true;
  error.value = '';
  try {
    const { data, error: fetchError } = await useFetch('/api/superadmin/settings/get');
    if (fetchError.value) {
      throw new Error(fetchError.value.message || 'Failed to load settings');
    }
    Object.assign(globalSettings, data.value.settings);
  } catch (err: any) {
    error.value = err.message || 'Unexpected error loading settings';
  } finally {
    loading.value = false;
  }
});

// Submit updated settings to backend API
const saveSettings = async () => {
  loading.value = true;
  error.value = '';
  success.value = '';
  try {
    const response = await $fetch('/api/superadmin/settings/update', {
      method: 'POST',
      body: globalSettings
    });
    if (!response.success) {
      throw new Error(response.message || 'Failed to save settings');
    }
    success.value = 'Settings saved successfully.';
  } catch (err: any) {
    error.value = err.message || 'Unexpected error saving settings';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-3xl mx-auto p-6 bg-white rounded shadow">
    <h1 class="text-2xl font-bold mb-6">Global System Settings</h1>

    <div v-if="loading" class="mb-4 text-blue-600 font-semibold">Loading...</div>
    <div v-if="error" class="mb-4 text-red-600 font-semibold">{{ error }}</div>
    <div v-if="success" class="mb-4 text-green-600 font-semibold">{{ success }}</div>

    <form @submit.prevent="saveSettings" class="space-y-6">
      <div>
        <label for="maxPlatforms" class="block font-medium mb-1">Maximum Platforms (Tenants)</label>
        <input
          id="maxPlatforms"
          type="number"
          min="1"
          v-model.number="globalSettings.maxPlatforms"
          class="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label for="maxOrganizationsPerPlatform" class="block font-medium mb-1">Max Organizations Per Platform</label>
        <input
          id="maxOrganizationsPerPlatform"
          type="number"
          min="1"
          v-model.number="globalSettings.maxOrganizationsPerPlatform"
          class="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label class="inline-flex items-center">
          <input
            type="checkbox"
            v-model="globalSettings.enableSelfRegistration"
            class="form-checkbox"
          />
          <span class="ml-2">Enable Self Registration for Organizations</span>
        </label>
      </div>

      <div>
        <label for="defaultUserRole" class="block font-medium mb-1">Default User Role</label>
        <select
          id="defaultUserRole"
          v-model="globalSettings.defaultUserRole"
          class="w-full border rounded px-3 py-2"
          required
        >
          <option value="user">User</option>
          <option value="organization_admin">Organization Admin</option>
          <option value="platform_admin">Platform Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>

      <div>
        <label class="inline-flex items-center">
          <input
            type="checkbox"
            v-model="globalSettings.maintenanceMode"
            class="form-checkbox"
          />
          <span class="ml-2">Enable Maintenance Mode (System-wide downtime)</span>
        </label>
      </div>

      <div>
        <button
          type="submit"
          :disabled="loading"
          class="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Save Settings
        </button>
      </div>
    </form>
  </div>
</template>
