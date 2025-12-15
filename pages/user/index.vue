<!-- pages/user/index.vue -->
<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">User Dashboard</h1>
    
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
      <!-- User Info Card -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Name</label>
            <div class="text-xl font-semibold text-gray-900">{{ userInfo.name || 'Loading...' }}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <div class="text-xl font-semibold text-gray-700">{{ userInfo.email || 'Loading...' }}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Role</label>
            <div class="text-xl font-semibold text-purple-700 capitalize">{{ userInfo.role ? userInfo.role.replace('_', ' ') : 'Loading...' }}</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        <!-- Profile Card -->
       

      

        <!-- Organization Card -->
        <div v-if="userInfo.organization" class="bg-white rounded-lg shadow-lg p-6">
          <div class="flex flex-col items-center text-center">
            <div class="bg-purple-100 rounded-full p-4 mb-4">
              <svg class="h-12 w-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Organization</h3>
            <p class="text-sm text-gray-600">{{ userInfo.organization.name }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ userInfo.organization.platform }}</p>
          </div>
        </div>
      </div>

      <!-- Statistics Cards - Hidden for employee role -->
      <div v-if="userInfo.role !== 'employee' && userInfo.role !== 'guest' && userInfo.role !== 'manager'" class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-6">
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-90">Total Documents</p>
              <p class="text-3xl font-bold mt-2">{{ stats.documents.total }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-90">Approved</p>
              <p class="text-3xl font-bold mt-2">{{ stats.documents.approved }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-90">Pending</p>
              <p class="text-3xl font-bold mt-2">{{ stats.documents.pending }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-90">Rejected</p>
              <p class="text-3xl font-bold mt-2">{{ stats.documents.rejected }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const auth = useAuthStore();

const stats = ref({
  documents: { total: 0, approved: 0, pending: 0, rejected: 0 }
});

const userInfo = ref({
  name: '',
  email: '',
  role: '',
  organization: null as { name: string; platform: string } | null
});

const loading = ref(true);
const error = ref('');

const loadStats = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    // Get user info from auth store
    await auth.fetchUser();
    if (auth.user) {
      userInfo.value.name = auth.user.name;
      userInfo.value.email = auth.user.email;
      userInfo.value.role = auth.user.role;
    }
    
    // Fetch user stats
    const response = await $fetch('/api/dashboard/user-stats') as any;
    if (response.success) {
      stats.value = response.stats;
      if (response.organization) {
        userInfo.value.organization = response.organization;
      }
    }
  } catch (err: any) {
    console.error('Failed to load user dashboard stats:', err);
    error.value = err.message || 'Failed to load dashboard statistics';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadStats();
});
</script>
