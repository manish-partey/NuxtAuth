<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['platform_admin']
});

interface Organization {
  _id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
}

const tenants = ref<Organization[]>([]);
const loading = ref(false);
const error = ref('');
const router = useRouter();

async function fetchTenants() {
  loading.value = true;
  error.value = '';
  try {
    const res = await $fetch('/api/org/listUsers', {
      credentials: 'include'
    });
    tenants.value = res.organizations || [];
  } catch {
    error.value = 'Failed to load tenants.';
  } finally {
    loading.value = false;
  }
}

function goToOrg(id: string) {
  router.push(`/org/${id}`);
}

onMounted(fetchTenants);
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Platform Management</h1>

    <div v-if="loading" class="text-gray-500">Loading platform...</div>
    <div v-if="error" class="text-red-600">{{ error }}</div>

    <table v-if="!loading && tenants.length" class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 p-2 text-left">Name</th>
          <th class="border border-gray-300 p-2 text-left">Type</th>
          <th class="border border-gray-300 p-2 text-left">Status</th>
          <th class="border border-gray-300 p-2 text-left">Created At</th>
          <th class="border border-gray-300 p-2 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="org in tenants" :key="org._id" class="hover:bg-gray-50">
          <td class="border border-gray-300 p-2">{{ org.name }}</td>
          <td class="border border-gray-300 p-2 capitalize">{{ org.type }}</td>
          <td class="border border-gray-300 p-2 capitalize">{{ org.status }}</td>
          <td class="border border-gray-300 p-2">{{ new Date(org.createdAt).toLocaleDateString() }}</td>
          <td class="border border-gray-300 p-2 text-center">
            <button @click="goToOrg(org._id)" class="text-blue-600 hover:underline">
              View
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!loading && !tenants.length" class="text-gray-500">No platform organizations found.</div>
  </div>
</template>
