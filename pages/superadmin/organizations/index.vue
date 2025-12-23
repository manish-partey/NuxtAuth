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
const deleting = ref<string | null>(null);

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

async function deleteOrganization(org: Organization) {
  const confirmed = confirm(
    `Are you sure you want to delete "${org.name}"?\n\n` +
    `This action cannot be undone. All organization data will be permanently removed.\n\n` +
    `Note: Organizations with users cannot be deleted.`
  );

  if (!confirmed) return;

  deleting.value = org._id;
  try {
    const response: any = await $fetch(`/api/org/${org._id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (response.success) {
      // Remove from local list
      organizations.value = organizations.value.filter(o => o._id !== org._id);
      alert('Organization deleted successfully');
    }
  } catch (err: any) {
    const errorMessage = err.data?.statusMessage || err.message || 'Failed to delete organization';
    alert(`Error: ${errorMessage}`);
    console.error('Delete organization error:', err);
  } finally {
    deleting.value = null;
  }
}

onMounted(fetchOrganizations);
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">All Organizations1</h1>
    <p class="mb-6 text-gray-600">View and manage all organizations under platforms.</p>

    <button
      @click="router.push('/organization-register')"
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
          <th class="border border-gray-300 p-2 text-left">Created At</th>
          <th class="border border-gray-300 p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="org in organizations"
          :key="org._id"
          class="hover:bg-gray-50"
        >
          <td class="border border-gray-300 p-2">{{ org.name }}</td>
          <td class="border border-gray-300 p-2">{{ org.platformName }}</td>
          <td class="border border-gray-300 p-2 capitalize">{{ org.type }}</td>
          <td class="border border-gray-300 p-2">
            {{ new Date(org.createdAt).toLocaleDateString() }}
          </td>
          <td class="border border-gray-300 p-2 text-center">
            <div class="flex gap-2 justify-center">
              <button
                @click.stop="goToOrgDetails(org._id)"
                class="text-blue-600 hover:underline"
              >
                View Details
              </button>
              <button
                @click.stop="router.push(`/superadmin/organizations/${org._id}/edit`)"
                class="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                @click.stop="deleteOrganization(org)"
                :disabled="deleting === org._id"
                class="text-red-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ deleting === org._id ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!loading && !organizations.length" class="text-gray-500">
      No organizations found.
    </div>
  </div>
</template>
