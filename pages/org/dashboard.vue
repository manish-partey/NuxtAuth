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
      <p class="text-gray-600 mb-6">Welcome to your organization control panel. From here you can manage users, settings, and invitations.</p>
      
      <!-- Primary Action Banner -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <svg class="h-8 w-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
            <div>
              <h3 class="text-lg font-medium text-blue-900">Team Management</h3>
              <p class="text-sm text-blue-700">Invite and manage your organization team members</p>
            </div>
          </div>
          <NuxtLink to="/org/users" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Manage Team
          </NuxtLink>
        </div>
      </div>
      
      <!-- Statistics Cards -->
      <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <!-- Users Stats -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-gray-600">Team Members</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.users.total }}</p>
              <p class="text-xs text-green-600">{{ stats.users.active }} active</p>
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

        <!-- Invites Stats -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-gray-600">Invitations</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.invites.total }}</p>
              <p class="text-xs text-orange-600">{{ stats.invites.pending }} pending</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Statistics -->
      <div class="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-8">
        <!-- Documents Breakdown -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Documents Status</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Organization Documents</span>
              <span class="text-sm font-medium text-blue-600">{{ stats.documents.organization }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">User Documents</span>
              <span class="text-sm font-medium text-green-600">{{ stats.documents.user }}</span>
            </div>
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

        <!-- User Status -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Team Status</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Active Users</span>
              <span class="text-sm font-medium text-green-600">{{ stats.users.active }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Inactive Users</span>
              <span class="text-sm font-medium text-gray-600">{{ stats.users.inactive }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mb-4">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
      </div>
      <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <NuxtLink to="/org/requirements" class="dashboard-action-card">
          <svg class="h-6 w-6 text-indigo-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
         
        </NuxtLink>
        
        <!-- Highlighted User Management Link -->
        <NuxtLink to="/org/users" class="dashboard-action-card dashboard-action-card-primary">
          <svg class="h-6 w-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
          </svg>
          <span class="text-blue-600 hover:underline font-medium">👥 Manage Users</span>
          <small class="text-xs text-blue-500 mt-1">Add, invite & manage team</small>
        </NuxtLink>
        
        <NuxtLink to="/org/invites" class="dashboard-action-card">
          <svg class="h-6 w-6 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <span class="text-green-600 hover:underline font-medium">Manage Invitations</span>
        </NuxtLink>
        
      
        
        <NuxtLink to="/org/settings" class="dashboard-action-card">
          <svg class="h-6 w-6 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <span class="text-purple-600 hover:underline font-medium">Organization Settings</span>
        </NuxtLink>
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

const loading = ref(true);
const error = ref('');

const loadStats = async () => {
  try {
    loading.value = true;
    const response = await $fetch('/api/dashboard/organization-stats');
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
