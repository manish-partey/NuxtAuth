<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface PlatformStats {
  organizationCount: number;
  userCount: number;
  documentCount: number;
  inviteCount: number;
}

const stats = ref<PlatformStats>({
  organizationCount: 0,
  userCount: 0,
  documentCount: 0,
  inviteCount: 0
});

const loading = ref(false);
const error = ref('');

async function fetchPlatformStats() {
  loading.value = true;
  error.value = '';
  try {
    // TODO: Replace with actual API endpoint when implemented
    const response: any = await $fetch('/api/platform-admin/dashboard', {
      credentials: 'include'
    }).catch(() => {
      // Fallback with mock data if API doesn't exist yet
      return {
        success: true,
        stats: {
          organizationCount: 5,
          userCount: 23,
          documentCount: 45,
          inviteCount: 3
        }
      };
    });

    if (response.success) {
      stats.value = response.stats;
    }
  } catch (e) {
    error.value = 'Failed to load platform statistics.';
  } finally {
    loading.value = false;
  }
}

onMounted(fetchPlatformStats);
</script>

<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">Platform Admin Dashboard</h1>
    <p class="text-gray-600 mb-8">
      Welcome to your platform administration panel. Manage organizations your platform.
    </p>

    <div v-if="loading" class="text-gray-500">Loading dashboard...</div>
    <div v-if="error" class="text-red-600 mb-4">{{ error }}</div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Organizations</dt>
              <dd class="text-lg font-medium text-gray-900">{{ stats.organizationCount }}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       

      <NuxtLink to="/platform/create-platform" 
        class="block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition border-purple-200 bg-purple-50">
        <h3 class="text-lg font-semibold text-purple-900 mb-2">Create New Platform</h3>
        <p class="text-purple-700">Create a new platform for your business vertical</p>
      </NuxtLink>

      <NuxtLink to="/platform/organizations" 
        class="block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Manage Organizations</h3>
        <p class="text-gray-600">View and manage organizations under your platform</p>
      </NuxtLink>

      <NuxtLink to="/platform/organization-types" 
        class="block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition border-amber-200 bg-amber-50">
        <h3 class="text-lg font-semibold text-amber-900 mb-2">Organization Types</h3>
        <p class="text-amber-700">Configure which organization types are available</p>
      </NuxtLink>

     

    

      <NuxtLink to="/platform/settings" 
        class="block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Platform Settings</h3>
        <p class="text-gray-600">Configure platform-wide settings</p>
      </NuxtLink>
    </div>
  </div>
</template>