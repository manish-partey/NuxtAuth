<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

interface Organization {
  _id: string;
  name: string;
  type: string;
  status: string;
  userCount: number;
  createdAt: string;
}

const organizations = ref<Organization[]>([]);
const loading = ref(false);
const error = ref('');
const router = useRouter();

async function fetchOrganizations() {
  loading.value = true;
  error.value = '';
  try {
    console.log('[ORGS-PAGE] Fetching organizations...');
    const response: any = await $fetch('/api/platform/organizations', {
      credentials: 'include'
    });
    
    console.log('[ORGS-PAGE] Response:', response);

    if (response.success) {
      organizations.value = response.organizations || [];
      console.log('[ORGS-PAGE] Loaded', organizations.value.length, 'organizations');
    } else {
      error.value = response.message || 'Failed to load organizations.';
      console.error('[ORGS-PAGE] API returned error:', error.value);
    }
  } catch (e: any) {
    console.error('[ORGS-PAGE] Fetch error:', e);
    error.value = e.data?.message || e.message || 'Failed to load organizations.';
  } finally {
    loading.value = false;
  }
}

async function goToOrganizationDetails(id: string) {
  console.log('[ORGS] Navigating to org details:', id);
  try {
    await navigateTo(`/platform/organizations/${id}`);
  } catch (e) {
    console.error('[ORGS] Navigation error:', e);
  }
}

onMounted(fetchOrganizations);
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Organizations</h1>
        <p class="text-gray-600">Manage organizations under your platform</p>
      </div>
      <NuxtLink to="/organization-register"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        + Add Organization
      </NuxtLink>
    </div>

    <div v-if="loading" class="text-gray-500">Loading organizations...</div>
    <div v-if="error" class="text-red-600">{{ error }}</div>

    <div v-if="!loading && organizations.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
      <p class="text-gray-500">Get started by creating your first organization</p>
    </div>

    <div v-if="!loading && organizations.length" class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Organization Name
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Users
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="org in organizations" :key="org._id" 
            class="hover:bg-gray-50 cursor-pointer" 
            @click="goToOrganizationDetails(org._id)">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ org.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
              {{ org.type.replace(/_/g, ' ') }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ org.userCount }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                :class="org.status === 'approved' ? 'bg-green-100 text-green-800' : 
                       org.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                       org.status === 'pending_documents' ? 'bg-orange-100 text-orange-800' :
                       org.status === 'pending_review' ? 'bg-blue-100 text-blue-800' : 
                       org.status === 'rejected' ? 'bg-red-100 text-red-800' :
                       org.status === 'suspended' ? 'bg-gray-100 text-gray-800' : 
                       'bg-gray-100 text-gray-800'">
                {{ org.status === 'approved' ? '✅ Approved' :
                   org.status === 'pending' ? '⏳ Pending' :
                   org.status === 'pending_documents' ? '📋 Needs Documents' :
                   org.status === 'pending_review' ? '🔍 Under Review' :
                   org.status === 'rejected' ? '❌ Rejected' :
                   org.status === 'suspended' ? '⏸️ Suspended' :
                   org.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ new Date(org.createdAt).toLocaleDateString() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <NuxtLink 
                :to="`/platform/organizations/${org._id}`"
                class="text-blue-600 hover:text-blue-900 hover:underline cursor-pointer">
                Manage
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>