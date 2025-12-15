<!-- pages/org/dashboard.vue -->
<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Organization Dashboard</h1>
    
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
      <!-- Organization Info Card -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Organization Name</label>
            <div class="text-xl font-semibold text-gray-900">{{ organizationInfo.name || 'Loading...' }}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Platform</label>
            <div class="text-xl font-semibold text-blue-600">{{ organizationInfo.platform.name || 'Loading...' }}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Your Role</label>
            <div class="text-xl font-semibold text-purple-700 capitalize">{{ organizationInfo.role ? organizationInfo.role.replace('_', ' ') : 'Loading...' }}</div>
          </div>
        </div>
      </div>

      <!-- Main Action Cards -->
      <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-6">
        <!-- Users Card -->
        <NuxtLink to="/org/users" class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105">
          <div class="flex flex-col items-center text-center">
            <div class="bg-blue-100 rounded-full p-4 mb-4">
              <svg class="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Users</h3>
            <p class="text-sm text-gray-600 mb-3">Manage team members</p>
            <div class="text-3xl font-bold text-blue-600">{{ stats.users.total }}</div>
            <p class="text-xs text-green-600 mt-1">{{ stats.users.active }} active</p>
          </div>
        </NuxtLink>

        <!-- Invites Card -->
        <NuxtLink to="/org/invites" class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105">
          <div class="flex flex-col items-center text-center">
            <div class="bg-orange-100 rounded-full p-4 mb-4">
              <svg class="h-12 w-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Invites</h3>
            <p class="text-sm text-gray-600 mb-3">Send invitations</p>
            <div class="text-3xl font-bold text-orange-600">{{ stats.invites.total }}</div>
            <p class="text-xs text-orange-500 mt-1">{{ stats.invites.pending }} pending</p>
          </div>
        </NuxtLink>

        <!-- Settings Card -->
        <NuxtLink to="/org/settings" class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105">
          <div class="flex flex-col items-center text-center">
            <div class="bg-purple-100 rounded-full p-4 mb-4">
              <svg class="h-12 w-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Settings</h3>
            <p class="text-sm text-gray-600">Organization settings</p>
          </div>
        </NuxtLink>
      </div>

      <!-- Activity Feed -->
      <div class="mt-8">
        <ActivityFeed :limit="15" :auto-refresh="true" :refresh-interval="30000" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const stats = ref({
  users: { total: 0, active: 0, inactive: 0 },
  documents: { organization: 0, user: 0, total: 0, pending: 0, approved: 0, rejected: 0 },
  invites: { total: 0, pending: 0 }
});

const organizationInfo = ref({
  name: '',
  platform: { name: '', id: '' },
  role: ''
});

const loading = ref(true);
const error = ref('');

const loadStats = async () => {
  try {
    loading.value = true;
    const response = await $fetch('/api/dashboard/organization-stats') as any;
    if (response.success) {
      stats.value = response.stats;
      // Extract organization and platform info from response
      if (response.organization) {
        organizationInfo.value.name = response.organization.name;
        organizationInfo.value.platform = response.organization.platform || { name: '', id: '' };
      }
      if (response.role) {
        organizationInfo.value.role = response.role;
      }
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

<style scoped>
.dashboard-action-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1rem;
  transition: background-color 0.15s ease-in-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 100px;
  border: 2px solid transparent;
}

.dashboard-action-card:hover {
  background-color: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.1), 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}

.dashboard-action-card-primary {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.dashboard-action-card-primary:hover {
  background-color: #dbeafe;
  border-color: #2563eb;
}

/* Responsive grid adjustments */
@media (max-width: 640px) {
  .grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1025px) and (max-width: 1280px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1281px) {
  .grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
</style>
