<template>
  <div class="max-w-xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-semibold text-gray-800 mb-6">Organization Settings</h1>

    <form @submit.prevent="updateOrg" class="bg-white p-6 shadow rounded-xl space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
        <input
          v-model="orgName"
          type="text"
          class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <button
        type="submit"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        :disabled="saving"
      >
        {{ saving ? 'Saving...' : 'Update Settings' }}
      </button>
    </form>

    <p v-if="success" class="text-green-600 mt-4">Organization updated successfully.</p>
    <p v-if="error" class="text-red-600 mt-4">Failed to update. Try again later.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFetch } from '#app';

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['org_admin'],
});

const orgName = ref('');
const saving = ref(false);
const success = ref(false);
const error = ref(false);

onMounted(async () => {
  const { data } = await useFetch('/api/org/details', {
    headers: useRequestHeaders(['cookie']),
  });
  orgName.value = data.value?.name || '';
});

async function updateOrg() {
  saving.value = true;
  success.value = false;
  error.value = false;

  try {
    const res = await $fetch('/api/org/update', {
      method: 'POST',
      body: { name: orgName.value },
    });
    success.value = res.success;
  } catch {
    error.value = true;
  } finally {
    saving.value = false;
  }
}
</script>
