<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="md:flex md:items-center md:justify-between mb-6">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Platform Management
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            Manage your platform settings and information
          </p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-sm text-gray-600">Loading platform details...</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <span class="text-red-800">{{ error }}</span>
        </div>
      </div>

      <!-- Platform Info Card -->
      <div v-if="platform && !loading" class="bg-white shadow rounded-lg mb-6">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Your Platform</h3>
          </div>
        </div>
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center">
                <h4 class="text-xl font-medium text-gray-900">{{ platform.name }}</h4>
                <span 
                  class="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="platform.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ platform.active ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <p class="mt-1 text-sm text-gray-600">{{ platform.description || 'No description provided' }}</p>
              <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span>Type: {{ platform.type || 'platform' }}</span>
                <span>Created: {{ formatDate(platform.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Platform Statistics -->
      <div v-if="platform && !loading" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m-5 0h6M7 11l3-3 3 3"></path>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Organizations</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ platform.organizationCount || 0 }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ platform.userCount || 0 }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Platform Status</dt>
                  <dd class="text-lg font-medium" :class="platform.active ? 'text-green-600' : 'text-red-600'">
                    {{ platform.active ? 'Active' : 'Inactive' }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink to="/platform/organizations" 
          class="block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Manage Organizations</h3>
          <p class="text-gray-600">View and manage organizations under your platform</p>
        </NuxtLink>

        <NuxtLink to="/platform/users" 
          class="block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Manage Users</h3>
          <p class="text-gray-600">View and manage all users across organizations</p>
        </NuxtLink>

       

        <NuxtLink to="/platform/invites" 
          class="block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Manage Invites</h3>
          <p class="text-gray-600">Send and manage organization invitations</p>
        </NuxtLink>

        <NuxtLink to="/platform/settings" 
          class="block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Platform Settings</h3>
          <p class="text-gray-600">Configure platform-wide settings</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth-guard'],
  roles: ['platform_admin']
});

interface Platform {
  _id: string;
  name: string;
  description: string;
  type: string;
  active: boolean;
  createdAt: string;
  organizationCount?: number;
  userCount?: number;
}

interface PlatformResponse {
  success: boolean;
  platform: Platform;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  platformId?: string;
  organizationId?: string;
}

interface UserResponse {
  success: boolean;
  user: User;
}

// State
const platform = ref<Platform | null>(null);
const loading = ref(true);
const error = ref('');

// Load current user's platform
const loadPlatform = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    // Get current user to get their platform ID
    const userResponse = await $fetch<UserResponse>('/api/auth/user', {
      credentials: 'include'
    });
    
    if (!userResponse.user?.platformId) {
      error.value = 'No platform assigned to your account. Please contact your administrator.';
      return;
    }
    
    // Get platform details
    const response = await $fetch<PlatformResponse>(`/api/superadmin/platforms/${userResponse.user.platformId}`, {
      credentials: 'include'
    });
    
    if (response.success && response.platform) {
      platform.value = response.platform;
    } else {
      error.value = 'Platform not found';
    }
  } catch (err: any) {
    console.error('Failed to load platform:', err);
    error.value = err.data?.message || 'Failed to load platform details';
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

// Load platform on mount
onMounted(() => {
  loadPlatform();
});
</script>