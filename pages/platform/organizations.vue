<template>
  <div class="max-w-6xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Organizations in Your Platform</h1>

    <div v-if="loading" class="text-gray-500">Loading organizations...</div>
    <div v-if="error" class="text-red-600 font-semibold">{{ error }}</div>

    <div v-if="!loading && organizations.length">
      <table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead class="bg-gray-100 text-gray-700 text-sm font-medium">
          <tr>
            <th class="text-left px-4 py-2">Name</th>
            <th class="text-left px-4 py-2">Slug</th>
            <th class="text-left px-4 py-2">Status</th>
            <th class="text-left px-4 py-2">Created At</th>
          </tr>
        </thead>
        <tbody class="text-gray-800 text-sm">
          <tr v-for="org in organizations" :key="org._id" class="border-t hover:bg-gray-50">
            <td class="px-4 py-2">{{ org.name }}</td>
            <td class="px-4 py-2">{{ org.slug }}</td>
            <td class="px-4 py-2 capitalize">{{ org.status }}</td>
            <td class="px-4 py-2">{{ new Date(org.createdAt).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="!loading" class="text-gray-600 italic">No organizations found under your platform.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRequestHeaders } from '#app';

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['platform_admin'],
});

const organizations = ref([]);
const loading = ref(false);
const error = ref('');

const fetchOrganizations = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await $fetch('/api/platform/organizations', {
      credentials: 'include',
      headers: useRequestHeaders(['cookie']),
    });
    if (res.success) {
      organizations.value = res.organizations;
    } else {
      error.value = res.message || 'Failed to fetch organizations.';
    }
  } catch (err) {
    error.value = 'Error fetching organizations.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchOrganizations);
</script>
