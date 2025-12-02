<script setup lang="ts">
import { ref, onMounted } from 'vue';

definePageMeta({
  middleware: ['auth-guard'],
  roles: ['super_admin']
});

const stats = ref({
  users: { total: 0, active: 0, inactive: 0 },
  organizations: { total: 0, pending: 0, approved: 0, rejected: 0 },
  platforms: { total: 0 },
  documents: { total: 0, pending: 0, approved: 0, rejected: 0 }
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
      <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <!-- Users Stats -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-gray-600">Total Users</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.users.total }}</p>
              <p class="text-xs text-green-600">{{ stats.users.active }} active</p>
            </div>
          </div>
        </div>

        <!-- Organizations Stats -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-gray-600">Organizations</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.organizations.total }}</p>
              <p class="text-xs text-orange-600">{{ stats.organizations.pending }} pending</p>
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
              <p class="text-sm font-medium text-gray-600">Platforms</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.platforms.total }}</p>
              <p class="text-xs text-gray-500">Active platforms</p>
            </div>
          </div>
        </div>

        <!-- Documents Stats -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-gray-600">Documents</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.documents.total }}</p>
              <p class="text-xs text-yellow-600">{{ stats.documents.pending }} pending review</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Statistics -->
      <div class="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-8">
        <!-- Organizations Breakdown -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Organizations Status</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Approved</span>
              <span class="text-sm font-medium text-green-600">{{ stats.organizations.approved }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Pending</span>
              <span class="text-sm font-medium text-orange-600">{{ stats.organizations.pending }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Rejected</span>
              <span class="text-sm font-medium text-red-600">{{ stats.organizations.rejected }}</span>
            </div>
          </div>
        </div>

        <!-- Documents Breakdown -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Documents Status</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Approved</span>
              <span class="text-sm font-medium text-green-600">{{ stats.documents.approved }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Pending</span>
              <span class="text-sm font-medium text-orange-600">{{ stats.documents.pending }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Rejected</span>
              <span class="text-sm font-medium text-red-600">{{ stats.documents.rejected }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <NuxtLink to="/superadmin/platforms" class="dashboard-card">
          <h2 class="text-xl font-semibold">Platforms</h2>
          <p class="text-sm text-gray-600">Create and manage platforms across the system.</p>
        </NuxtLink>

        <NuxtLink to="/organization-register" class="dashboard-card">
          <h2 class="text-xl font-semibold">Create Organization</h2>
          <p class="text-sm text-gray-600">Register new organizations in the system.</p>
        </NuxtLink>

       

        

        <NuxtLink to="/superadmin/settings" class="dashboard-card">
          <h2 class="text-xl font-semibold">Global Settings</h2>
          <p class="text-sm text-gray-600">Manage global configurations, access control, and system health.</p>
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
