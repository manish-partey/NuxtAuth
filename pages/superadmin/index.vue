<script setup lang="ts">
import { ref, onMounted } from 'vue';

definePageMeta({
  middleware: ['auth-guard'],
  roles: ['super_admin']
});

const stats = ref({
  users: { total: 0, active: 0, inactive: 0 },
  organizations: { total: 0, pending: 0, approved: 0, rejected: 0 },
  platforms: { total: 0 }
});

const loading = ref(true);
const error = ref('');

const loadStats = async () => {
  try {
    loading.value = true;
    const response = await $fetch<{ success: boolean; stats: typeof stats.value }>('/api/dashboard/superadmin-stats');
    if (response.success) {
      stats.value = response.stats;
    }
  } catch (err: any) {
    console.error('Failed to load dashboard stats:', err);
    error.value = 'Failed to load dashboard statistics';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadStats();
});
</script>

<template>
  <div class="max-w-6xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Super Admin Dashboard</h1>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-800">{{ error }}</p>
      <button @click="loadStats" class="mt-2 text-sm text-red-600 hover:text-red-800 underline">
        Try Again
      </button>
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- Statistics Cards -->
      <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 mb-8">
        <!-- Organizations Stats -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-gray-600">All Organizations</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.organizations.total }}</p>
              
            </div>
          </div>
        </div>

        <!-- Platforms Stats -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
              </svg>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-gray-600">All Platforms</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.platforms.total }}</p>
              <p class="text-xs text-gray-500">Active platforms</p>
            </div>
          </div>
        </div>

      </div>

      <!-- Quick Actions -->
      <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink to="/superadmin/platforms" class="dashboard-card">
          <h2 class="text-xl font-semibold">All Platforms</h2>
          <p class="text-sm text-gray-600">View and manage all platforms in the system.</p>
        </NuxtLink>

        <NuxtLink to="/superadmin/organizations" class="dashboard-card">
          <h2 class="text-xl font-semibold">All Organizations</h2>
          <p class="text-sm text-gray-600">Manage all organizations across all platforms.</p>
        </NuxtLink>

        <NuxtLink to="/superadmin/settings" class="dashboard-card">
          <h2 class="text-xl font-semibold">Settings</h2>
          <p class="text-sm text-gray-600">Configure global system settings and preferences.</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
@layer components {
  .dashboard-card {
    @apply bg-white rounded-2xl shadow p-6 hover:bg-gray-50 transition;
  }
}
</style>
