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
    <div class="mb-6 bg-white rounded-lg shadow p-4">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-gray-800">Super Admin Dashboard</h1>
        <div class="text-right">
          <label class="text-sm font-medium text-gray-600">Your Role</label>
          <div class="text-lg font-semibold text-purple-700">
            Super Admin
          </div>
        </div>
      </div>
    </div>

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
      <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <!-- Total Users Stats -->
        <NuxtLink to="/superadmin/users" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-gray-600">Total Users</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.users.total }}</p>
              <p class="text-xs text-gray-500">Click to view all users</p>
            </div>
          </div>
        </NuxtLink>

        <!-- Organizations Stats -->
        <NuxtLink to="/superadmin/organizations" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-gray-600">Total Organizations</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.organizations.total }}</p>
              <p class="text-xs text-gray-500">Click to view all organizations</p>
            </div>
          </div>
        </NuxtLink>

        <!-- Platforms Stats -->
        <NuxtLink to="/superadmin/platforms" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
              </svg>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-gray-600">Total Platforms</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.platforms.total }}</p>
              <p class="text-xs text-gray-500">Click to view all platforms</p>
            </div>
          </div>
        </NuxtLink>

      </div>

      <!-- Quick Actions -->
      <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink to="/superadmin/platforms" class="dashboard-card">
          <h2 class="text-xl font-semibold">All Platforms</h2>
          <p class="text-sm text-gray-600">View and manage all platforms in the system.</p>
        </NuxtLink>

        <NuxtLink to="/superadmin/organizations" class="dashboard-card">
          <h2 class="text-xl font-semibold">All Organizations1</h2>
          <p class="text-sm text-gray-600">Manage all organizations across all platforms.</p>
        </NuxtLink>

        <NuxtLink to="/superadmin/settings" class="dashboard-card">
          <h2 class="text-xl font-semibold">Settings</h2>
          <p class="text-sm text-gray-600">Configure global system settings and preferences.</p>
        </NuxtLink>
      </div>

      <!-- Activity Feed -->
      <div class="mt-8">
        <ActivityFeed :limit="20" :auto-refresh="true" :refresh-interval="30000" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-card {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  transition: background-color 0.15s ease-in-out;
}
.dashboard-card:hover {
  background-color: #f9fafb;
}
</style>
