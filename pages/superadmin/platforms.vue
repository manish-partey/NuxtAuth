<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="md:flex md:items-center md:justify-between mb-6">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Super Admin - Platform Management
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            Manage all platforms and their document requirements
          </p>
        </div>
        <div class="mt-4 flex md:mt-0 md:ml-4">
          <button
            @click="showCreatePlatformModal = true"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Create Platform
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
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
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Platforms</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ platforms.length }}</dd>
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m-5 0h6M7 11l3-3 3 3"></path>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Organizations</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.totalOrganizations }}</dd>
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.totalUsers }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Document Types</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.totalDocumentTypes }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Platforms List -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">All Platforms</h3>
        </div>
        <div class="overflow-hidden">
          <div v-if="platforms.length === 0" class="p-6 text-center text-gray-500">
            No platforms created yet. Create your first platform to get started.
          </div>
          <div v-else class="divide-y divide-gray-200">
            <div
              v-for="platform in platforms"
              :key="platform._id"
              class="p-6 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center">
                    <h4 class="text-lg font-medium text-gray-900">{{ platform.name }}</h4>
                    <span 
                      class="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="platform.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    >
                      {{ platform.active ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                  <p class="mt-1 text-sm text-gray-600">{{ platform.description }}</p>
                  <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Organizations: {{ platform.organizationCount || 0 }}</span>
                    <span>Users: {{ platform.userCount || 0 }}</span>
                    <span>Created: {{ formatDate(platform.createdAt) }}</span>
                  </div>
                </div>
                <div class="flex items-center space-x-3">
                  <button
                    @click="managePlatformDocuments(platform)"
                    class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg class="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Manage Documents
                  </button>
                  <button
                    @click="editPlatform(platform)"
                    class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg class="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Platform Modal -->
      <div
        v-if="showCreatePlatformModal"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        @click="closeCreatePlatformModal"
      >
        <div class="relative top-20 mx-auto p-5 border max-w-md shadow-lg rounded-md bg-white" @click.stop>
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Create New Platform</h3>
            <form @submit.prevent="createPlatform">
              <div class="space-y-4">
                <div>
                  <label for="platformName" class="block text-sm font-medium text-gray-700">Platform Name</label>
                  <input
                    v-model="newPlatform.name"
                    type="text"
                    id="platformName"
                    required
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., Hotel Booking Platform"
                  />
                </div>
                <div>
                  <label for="platformDescription" class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    v-model="newPlatform.description"
                    id="platformDescription"
                    rows="3"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Describe the platform's purpose..."
                  ></textarea>
                </div>
              </div>
              <div class="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  @click="closeCreatePlatformModal"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="isCreatingPlatform"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {{ isCreatingPlatform ? 'Creating...' : 'Create Platform' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth-guard'],
  roles: ['super_admin']
});

// Types
interface Platform {
  _id: string;
  name: string;
  description: string;
  active: boolean;
  createdAt: string;
  organizationCount?: number;
  userCount?: number;
}

interface PlatformsResponse {
  success: boolean;
  platforms: Platform[];
}

interface CreatePlatformResponse {
  success: boolean;
  message: string;
  platform: Platform;
}

interface StatsResponse {
  success: boolean;
  totalPlatforms: number;
  totalOrganizations: number;
  totalUsers: number;
  totalDocumentTypes: number;
}

// Reactive state
const platforms = ref<Platform[]>([]);
const showCreatePlatformModal = ref(false);
const isCreatingPlatform = ref(false);
const newPlatform = ref({
  name: '',
  description: ''
});

const stats = ref({
  totalOrganizations: 0,
  totalUsers: 0,
  totalDocumentTypes: 0
});

// Methods
const loadPlatforms = async () => {
  try {
    const response = await $fetch<PlatformsResponse>('/api/superadmin/platforms', {
      credentials: 'include'
    });
    
    if (response.success && response.platforms) {
      platforms.value = response.platforms;
    } else {
      console.warn('Unexpected response structure:', response);
      platforms.value = [];
    }
  } catch (error) {
    console.error('Failed to load platforms:', error);
    platforms.value = [];
  }
};

const loadStats = async () => {
  try {
    const response = await $fetch<StatsResponse>('/api/superadmin/stats', {
      credentials: 'include'
    });
    
    if (response.success) {
      stats.value = {
        totalOrganizations: response.totalOrganizations,
        totalUsers: response.totalUsers,
        totalDocumentTypes: response.totalDocumentTypes
      };
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
    stats.value = {
      totalOrganizations: 0,
      totalUsers: 0,
      totalDocumentTypes: 0
    };
  }
};

const createPlatform = async () => {
  isCreatingPlatform.value = true;
  try {
    const response = await $fetch<CreatePlatformResponse>('/api/superadmin/platforms', {
      method: 'POST',
      credentials: 'include',
      body: newPlatform.value
    });
    
    if (response.success) {
      alert(response.message || 'Platform created successfully!');
      closeCreatePlatformModal();
      loadPlatforms(); // Reload the platforms list
    }
  } catch (error: any) {
    console.error('Failed to create platform:', error);
    alert(error.data?.message || 'Failed to create platform');
  } finally {
    isCreatingPlatform.value = false;
  }
};

const managePlatformDocuments = (platform: Platform) => {
  // Navigate to platform document management
  navigateTo(`/superadmin/platforms/${platform._id}/documents`);
};

const editPlatform = (platform: Platform) => {
  // Navigate to platform edit page
  navigateTo(`/superadmin/platforms/${platform._id}/edit`);
};

const closeCreatePlatformModal = () => {
  showCreatePlatformModal.value = false;
  newPlatform.value = {
    name: '',
    description: ''
  };
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

// Lifecycle
onMounted(() => {
  loadPlatforms();
  loadStats();
});
</script>