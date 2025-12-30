<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="md:flex md:items-center md:justify-between mb-6">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Super Admin1 - Platform Management
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            Manage all platforms and their document requirements
          </p>
        </div>
        <div class="mt-4 flex md:mt-0 md:ml-4">
          <NuxtLink
            to="/superadmin/create-platform"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Create Platform
          </NuxtLink>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <NuxtLink to="/superadmin/platforms" class="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow">
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
        </NuxtLink>

        <NuxtLink to="/superadmin/organizations" class="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow">
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
        </NuxtLink>

        <NuxtLink to="/superadmin/users" class="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow">
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
        </NuxtLink>

       
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
            <NuxtLink
              v-for="platform in platforms"
              :key="platform._id"
              :to="`/superadmin/platforms/${platform._id}`"
              class="block p-6 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center">
                    <h4 class="text-lg font-medium text-gray-900 hover:text-blue-600">{{ platform.name }}</h4>
                    <span 
                      class="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="platform.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    >
                      {{ platform.status === 'active' ? 'Active' : 'Suspended' }}
                    </span>
                  </div>
                  <p class="mt-1 text-sm text-gray-600">{{ platform.description }}</p>
                  <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Organizations: {{ platform.organizationCount || 0 }}</span>
                    <span>Users: {{ platform.userCount || 0 }}</span>
                    <span>Created: {{ formatDate(platform.createdAt) }}</span>
                  </div>
                </div>
                <div class="flex items-center space-x-3" @click.stop>
                  
                  <NuxtLink
                    :to="`/superadmin/platforms/${platform._id}/organization-types`"
                    class="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    title="Manage Organization Types for this platform"
                  >
                    <svg class="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Org Types
                  </NuxtLink>
                  
                  <button
                    @click.stop.prevent="togglePlatformStatus(platform)"
                    class="inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                    :class="platform.status === 'active' 
                      ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100 focus:ring-red-500' 
                      : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100 focus:ring-green-500'"
                    :disabled="isTogglingStatus"
                  >
                    <svg v-if="platform.status === 'active'" class="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <svg v-else class="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {{ platform.status === 'active' ? 'Suspend' : 'Activate' }}
                  </button>
                
                  <button
                    @click.stop.prevent="editPlatform(platform)"
                    class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg class="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Edit
                  </button>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>



      <!-- Edit Platform Modal -->
      <div
        v-if="showEditPlatformModal"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        @click="closeEditPlatformModal"
      >
        <div class="relative top-20 mx-auto p-5 border max-w-md shadow-lg rounded-md bg-white" @click.stop>
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Edit Platform</h3>
            <form @submit.prevent="updatePlatform">
              <div class="space-y-4">
                <div>
                  <label for="editPlatformName" class="block text-sm font-medium text-gray-700">Platform Name</label>
                  <input
                    v-model="editPlatformData.name"
                    type="text"
                    id="editPlatformName"
                    required
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., Hotel Booking Platform"
                  />
                </div>
                <div>
                  <label for="editPlatformDescription" class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    v-model="editPlatformData.description"
                    id="editPlatformDescription"
                    rows="3"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Describe the platform's purpose..."
                  ></textarea>
                </div>
                <div>
                  <label for="editPlatformCategory" class="block text-sm font-medium text-gray-700">Platform Category</label>
                  <select
                    v-model="editPlatformData.category"
                    id="editPlatformCategory"
                    required
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="" disabled>Select category...</option>
                    <option v-for="cat in platformCategories" :key="cat.value" :value="cat.value">
                      {{ cat.label }}
                    </option>
                  </select>
                  <p class="mt-1 text-sm text-gray-500">Determines available organization types</p>
                </div>
                <div>
                  <label class="flex items-center">
                    <input
                      v-model="editPlatformData.active"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span class="ml-2 text-sm font-medium text-gray-700">Active Status</span>
                  </label>
                  <p class="mt-1 text-sm text-gray-500">Enable or disable this platform</p>
                </div>
              </div>
              <div class="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  @click="closeEditPlatformModal"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="isEditingPlatform"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {{ isEditingPlatform ? 'Updating...' : 'Update Platform' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Nested routes (organization-types, etc) -->
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth-guard'],
  roles: ['super_admin']
});

// Import router for navigation
const router = useRouter();

// Types
interface Platform {
  _id: string;
  name: string;
  description: string;
  status: string;
  active?: boolean;
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
const showEditPlatformModal = ref(false);
const isEditingPlatform = ref(false);
const isTogglingStatus = ref(false);
const editingPlatform = ref<Platform | null>(null);
const editPlatformData = ref({
  name: '',
  description: '',
  category: '',
  active: false
});

const platformCategories = [
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'education', label: 'Education' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'other', label: 'Other' }
];

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

const managePlatformDocuments = (platform: Platform) => {
  // Navigate to platform document management
  router.push(`/superadmin/platforms/${platform._id}/documents`);
};

const togglePlatformStatus = async (platform: Platform) => {
  if (isTogglingStatus.value) return;
  
  const action = platform.status === 'active' ? 'suspend' : 'activate';
  const warningMessage = platform.status === 'active' 
    ? `Are you sure you want to suspend "${platform.name}"? All users under this platform will be unable to access the system.`
    : `Are you sure you want to activate "${platform.name}"?`;
  
  if (!confirm(warningMessage)) {
    return;
  }
  
  isTogglingStatus.value = true;
  
  try {
    const response = await $fetch(`/api/superadmin/platforms/${platform._id}/toggle-status`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (response.success) {
      // Reload platforms to get updated status
      await loadPlatforms();
      alert(response.message || `Platform ${action}d successfully!`);
    }
  } catch (error: any) {
    console.error('Failed to toggle platform status:', error);
    alert(error.data?.message || `Failed to ${action} platform`);
  } finally {
    isTogglingStatus.value = false;
  }
};

const editPlatform = (platform: Platform) => {
  console.log("=== EDIT PLATFORM CLICKED ===");
  console.log("Platform:", platform);
  
  if (!platform._id) {
    alert('Platform ID is missing');
    return;
  }
  
  // Set up edit modal
  editingPlatform.value = platform;
  editPlatformData.value = {
    name: platform.name,
    description: platform.description,
    category: (platform as any).category || 'other',
    active: platform.active || false
  };
  showEditPlatformModal.value = true;
};

const updatePlatform = async () => {
  if (!editingPlatform.value) return;
  
  isEditingPlatform.value = true;
  try {
    const response = await $fetch(`/api/superadmin/platforms/${editingPlatform.value._id}`, {
      method: 'PUT',
      credentials: 'include',
      body: editPlatformData.value
    });
    
    if (response.success) {
      // Update local platform data
      const index = platforms.value.findIndex(p => p._id === editingPlatform.value!._id);
      if (index !== -1) {
        platforms.value[index] = {
          ...platforms.value[index],
          name: editPlatformData.value.name,
          description: editPlatformData.value.description,
          active: editPlatformData.value.active
        };
      }
      
      alert('Platform updated successfully!');
      closeEditPlatformModal();
    }
  } catch (error: any) {
    console.error('Failed to update platform:', error);
    alert(error.data?.message || 'Failed to update platform');
  } finally {
    isEditingPlatform.value = false;
  }
};

const closeEditPlatformModal = () => {
  showEditPlatformModal.value = false;
  editingPlatform.value = null;
  editPlatformData.value = {
    name: '',
    description: '',
    category: '',
    active: false
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