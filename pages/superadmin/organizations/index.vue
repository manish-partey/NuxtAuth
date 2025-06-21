<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

interface Organization {
  _id: string;
  name: string;
  platformName: string;
  status: string;
  createdAt: string;
  type: string;
}

const organizations = ref<Organization[]>([]);
const loading = ref(false);
const error = ref('');
const router = useRouter();

async function fetchOrganizations() {
  loading.value = true;
  error.value = '';
  try {
    const res = await $fetch('/api/org/listAll', {
      credentials: 'include'
    });
    organizations.value = res.organizations || [];
  } catch {
    error.value = 'Failed to load organizations.';
  } finally {
    loading.value = false;
  }
}

function goToOrgDetails(id: string) {
  router.push(`/superadmin/organizations/${id}`);
}

onMounted(fetchOrganizations);
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">All Organizations</h1>
    <p class="mb-6 text-gray-600">View and manage all organizations under platforms.</p>

    <button
      @click="router.push('/superadmin/create-organization')"
      class="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
    >
      + Create New Organization
    </button>

    <div v-if="loading" class="text-gray-500">Loading organizations...</div>
    <div v-if="error" class="text-red-600">{{ error }}</div>

    <table
      v-if="!loading && organizations.length"
      class="w-full border-collapse border border-gray-300"
    >
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 p-2 text-left">Name</th>
          <th class="border border-gray-300 p-2 text-left">Platform</th>
          <th class="border border-gray-300 p-2 text-left">Type</th>
          <th class="border border-gray-300 p-2 text-left">Status</th>
          <th class="border border-gray-300 p-2 text-left">Created At</th>
          <th class="border border-gray-300 p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="org in organizations"
          :key="org._id"
          class="hover:bg-gray-50 cursor-pointer"
          @click="goToOrgDetails(org._id)"
        >
          <td class="border border-gray-300 p-2">{{ org.name }}</td>
          <td class="border border-gray-300 p-2">{{ org.platformName }}</td>
          <td class="border border-gray-300 p-2 capitalize">{{ org.type }}</td>
          <td class="border border-gray-300 p-2 capitalize">{{ org.status }}</td>
          <td class="border border-gray-300 p-2">
            {{ new Date(org.createdAt).toLocaleDateString() }}
          </td>
          <td class="border border-gray-300 p-2 text-center">
            <button
              @click.stop="router.push(`/superadmin/organizations/${org._id}/edit`)"
              class="text-blue-600 hover:underline"
            >
              Edit
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!loading && !organizations.length" class="text-gray-500">
      No organizations found.
    </div>
  </div>
</template>
