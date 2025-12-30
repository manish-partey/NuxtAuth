<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

definePageMeta({
  middleware: ['auth-guard'],
  roles: ['super_admin']
});

const route = useRoute();
const router = useRouter();
const platformId = route.params.id as string;

interface Organization {
  _id: string;
  name: string;
  description: string;
  status: string;
  type: string;
  typeIcon: string;
  userCount: number;
  createdAt: string;
}

interface Platform {
  _id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
}

const platform = ref<Platform | null>(null);
const organizations = ref<Organization[]>([]);
const loading = ref(true);
const error = ref('');

const stats = computed(() => ({
  total: organizations.value.length,
  approved: organizations.value.filter(o => o.status === 'approved').length,
  pending: organizations.value.filter(o => o.status === 'pending' || o.status === 'pending_documents').length,
  totalUsers: organizations.value.reduce((sum, o) => sum + o.userCount, 0)
}));

onMounted(async () => {
  console.log('[PLATFORM DETAIL] Page mounted, platformId:', platformId, 'route.path:', route.path);
  await loadPlatform();
  // Note: Organizations list removed - endpoint doesn't exist yet
});

const loadPlatform = async () => {
  try {
    const response: any = await $fetch(`/api/superadmin/platforms/${platformId}`);
    if (response.success) {
      platform.value = response.platform;
    }
  } catch (err: any) {
    console.error('Failed to load platform:', err);
    error.value = 'Failed to load platform details';
  }
};

const loadOrganizations = async () => {
  try {
    loading.value = true;
    const response: any = await $fetch(`/api/superadmin/platforms/${platformId}/organizations`);
    if (response.success) {
      organizations.value = response.organizations;
    }
  } catch (err: any) {
    console.error('Failed to load organizations:', err);
    error.value = 'Failed to load organizations';
  } finally {
    loading.value = false;
  }
};

const viewOrganization = (orgId: string) => {
  router.push(`/superadmin/platforms/${platformId}/organizations/${orgId}`);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    'approved': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'pending_documents': 'bg-orange-100 text-orange-800',
    'pending_review': 'bg-blue-100 text-blue-800',
    'rejected': 'bg-red-100 text-red-800',
    'suspended': 'bg-gray-100 text-gray-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'approved': '✅ Approved',
    'pending': '⏳ Pending',
    'pending_documents': '📋 Needs Documents',
    'pending_review': '🔍 Under Review',
    'rejected': '❌ Rejected',
    'suspended': '⏸️ Suspended'
  };
  return labels[status] || status;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Breadcrumb -->
      <nav class="mb-6 text-sm">
        <ol class="flex items-center space-x-2 text-gray-600">
          <li><NuxtLink to="/superadmin" class="hover:text-blue-600">Super Admin</NuxtLink></li>
          <li>›</li>
          <li><NuxtLink to="/superadmin/platforms" class="hover:text-blue-600">Platforms</NuxtLink></li>
          <li>›</li>
          <li class="text-gray-900 font-medium">{{ platform?.name || 'Platform Details' }}</li>
        </ol>
      </nav>

      <!-- Platform Header -->
      <div v-if="platform" class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ platform.name }}</h1>
            <p v-if="platform.description" class="text-gray-600 mb-4">{{ platform.description }}</p>
            <div class="flex items-center space-x-4 text-sm text-gray-500">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                :class="platform.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                {{ platform.status === 'active' ? '✅ Active' : '⏸️ Suspended' }}
              </span>
              <span>Created: {{ formatDate(platform.createdAt) }}</span>
            </div>
          </div>
          <div class="flex gap-3">
            <button
              @click="router.push(`/superadmin/platforms/${platformId}/organization-types`)"
              class="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              ⚙️ Manage Org Types
            </button>
            <button
              @click="router.push('/superadmin/platforms')"
              class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back to Platforms
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-600 mb-2">Total Organizations</div>
          <div class="text-3xl font-bold text-blue-600">{{ stats.total }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-600 mb-2">Approved</div>
          <div class="text-3xl font-bold text-green-600">{{ stats.approved }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-600 mb-2">Pending</div>
          <div class="text-3xl font-bold text-yellow-600">{{ stats.pending }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-600 mb-2">Total Users</div>
          <div class="text-3xl font-bold text-purple-600">{{ stats.totalUsers }}</div>
        </div>
      </div>

      <!-- Organizations List -->
      <div class="bg-white rounded-lg shadow-md">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Organizations</h2>
        </div>

        <div v-if="loading" class="p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Loading organizations...</p>
        </div>

        <div v-else-if="error" class="p-6 text-center text-red-600">{{ error }}</div>

        <div v-else-if="organizations.length === 0" class="p-12 text-center text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          <p>No organizations found for this platform</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="org in organizations" :key="org._id" 
                class="hover:bg-gray-50 cursor-pointer" 
                @click="viewOrganization(org._id)">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ org.name }}</div>
                  <div v-if="org.description" class="text-sm text-gray-500">{{ org.description }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  {{ org.typeIcon }} {{ org.type }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ org.userCount }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    :class="getStatusClass(org.status)">
                    {{ getStatusLabel(org.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(org.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm" @click.stop>
                  <button
                    @click="viewOrganization(org._id)"
                    class="text-blue-600 hover:text-blue-900 font-medium">
                    View Details →
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
