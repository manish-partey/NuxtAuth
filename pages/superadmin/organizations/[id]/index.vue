<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

definePageMeta({
  middleware: ['auth-guard'],
  roles: ['super_admin']
});

const route = useRoute();
const router = useRouter();
const orgId = route.params.id as string;

const organization = ref<any>(null);
const loading = ref(true);
const error = ref('');
const users = ref<any[]>([]);
const loadingUsers = ref(false);

async function fetchOrganization() {
  loading.value = true;
  error.value = '';
  try {
    const response: any = await $fetch(`/api/org/${orgId}`, {
      credentials: 'include'
    });
    organization.value = response.organization;
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to load organization details';
    console.error('Error loading organization:', err);
  } finally {
    loading.value = false;
  }
}

async function fetchUsers() {
  loadingUsers.value = true;
  try {
    const response: any = await $fetch(`/api/org/${orgId}/users`, {
      credentials: 'include'
    });
    users.value = response.users || [];
  } catch (err) {
    console.error('Error loading users:', err);
  } finally {
    loadingUsers.value = false;
  }
}

onMounted(() => {
  fetchOrganization();
  fetchUsers();
});
</script>

<template>
  <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-6">
      <button
        @click="router.push('/superadmin/organizations')"
        class="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
      >
        ← Back to Organizations
      </button>
      <h1 class="text-3xl font-bold text-gray-900">Organization Details</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
      <button @click="fetchOrganization" class="mt-2 text-sm text-red-600 hover:text-red-800 underline">
        Try Again
      </button>
    </div>

    <!-- Organization Details -->
    <div v-else-if="organization" class="space-y-6">
      <!-- Basic Information Card -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Basic Information</h2>
          <div class="flex gap-2">
            <button
              @click="router.push(`/superadmin/organizations/${orgId}/edit`)"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Organization Name</label>
            <p class="text-lg text-gray-900">{{ organization.name }}</p>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-500">Status</label>
            <p class="text-lg">
              <span
                :class="{
                  'text-green-600 bg-green-100': organization.status === 'approved',
                  'text-yellow-600 bg-yellow-100': organization.status === 'pending',
                  'text-red-600 bg-red-100': organization.status === 'rejected'
                }"
                class="px-3 py-1 rounded-full text-sm font-medium"
              >
                {{ organization.status }}
              </span>
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-500">Platform</label>
            <p class="text-lg text-gray-900">{{ organization.platformName || 'N/A' }}</p>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-500">Organization Type</label>
            <p class="text-lg text-gray-900">{{ organization.type || organization.typeString || 'N/A' }}</p>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-500">Slug</label>
            <p class="text-lg text-gray-900 font-mono">{{ organization.slug }}</p>
          </div>

          <div v-if="organization.domain">
            <label class="text-sm font-medium text-gray-500">Domain</label>
            <p class="text-lg text-gray-900">{{ organization.domain }}</p>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-500">Created At</label>
            <p class="text-lg text-gray-900">{{ new Date(organization.createdAt).toLocaleString() }}</p>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-500">Updated At</label>
            <p class="text-lg text-gray-900">{{ new Date(organization.updatedAt).toLocaleString() }}</p>
          </div>
        </div>

        <div v-if="organization.description" class="mt-4">
          <label class="text-sm font-medium text-gray-500">Description</label>
          <p class="text-gray-900 mt-1">{{ organization.description }}</p>
        </div>
      </div>

      <!-- Approval Information (if applicable) -->
      <div v-if="organization.status === 'approved' && organization.approvedBy" class="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-green-900 mb-3">Approval Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-green-700">Approved By</label>
            <p class="text-green-900">{{ organization.approvedBy }}</p>
          </div>
          <div v-if="organization.approvedAt">
            <label class="text-sm font-medium text-green-700">Approved At</label>
            <p class="text-green-900">{{ new Date(organization.approvedAt).toLocaleString() }}</p>
          </div>
        </div>
      </div>

      <!-- Rejection Information (if applicable) -->
      <div v-if="organization.status === 'rejected'" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-red-900 mb-3">Rejection Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="organization.rejectedBy">
            <label class="text-sm font-medium text-red-700">Rejected By</label>
            <p class="text-red-900">{{ organization.rejectedBy }}</p>
          </div>
          <div v-if="organization.rejectedAt">
            <label class="text-sm font-medium text-red-700">Rejected At</label>
            <p class="text-red-900">{{ new Date(organization.rejectedAt).toLocaleString() }}</p>
          </div>
        </div>
        <div v-if="organization.rejectionReason" class="mt-3">
          <label class="text-sm font-medium text-red-700">Rejection Reason</label>
          <p class="text-red-900">{{ organization.rejectionReason }}</p>
        </div>
      </div>

      <!-- Users in Organization -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Users ({{ users.length }})</h2>
        
        <div v-if="loadingUsers" class="text-center py-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>

        <div v-else-if="users.length === 0" class="text-center py-8 text-gray-500">
          No users in this organization yet
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user._id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{{ user.role }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    :class="{
                      'text-green-600 bg-green-100': user.active,
                      'text-gray-600 bg-gray-100': !user.active
                    }"
                    class="px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {{ user.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
