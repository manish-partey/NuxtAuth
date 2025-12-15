<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

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

const platformName = ref<string>('');
const loading = ref(false);
const error = ref('');

async function fetchPlatformDetails() {
  if (authStore.user?.platformId) {
    try {
      const response: any = await $fetch(`/api/platform/${authStore.user.platformId}`, {
        credentials: 'include'
      });
      if (response.success && response.platform) {
        platformName.value = response.platform.name;
      }
    } catch (e) {
      console.error('Failed to load platform details:', e);
    }
  }
}

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

onMounted(() => {
  fetchPlatformDetails();
  fetchPlatformStats();
});
</script>

<template>
  <div class="p-6">
    <div class="mb-6 bg-white rounded-lg shadow p-4">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h1 class="text-3xl font-bold mb-2">Platform Admin Dashboard</h1>
          <p class="text-gray-600 mb-2">
            Welcome to your platform administration panel.
          </p>
          <div v-if="platformName" class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-600">Platform:</span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
              {{ platformName }}
            </span>
          </div>
        </div>
        <div class="text-right">
          <label class="text-sm font-medium text-gray-600">Your Role</label>
          <div class="text-lg font-semibold text-purple-700 capitalize">
            Platform Admin
          </div>
        </div>
      </div>
    </div>

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
       
      <NuxtLink to="/platform/pending-organizations" 
        class="block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition border-orange-200 bg-orange-50">
        <h3 class="text-lg font-semibold text-orange-900 mb-2">Pending Approvals</h3>
        <p class="text-orange-700">Review and approve organization registrations</p>
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

    <!-- Activity Feed -->
    <div class="mt-8">
      <ActivityFeed :limit="15" :auto-refresh="true" :refresh-interval="30000" />
    </div>
  </div>
</template>