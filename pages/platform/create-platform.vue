<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  middleware: ['auth-guard'],
  roles: ['super_admin', 'platform_admin']
});

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const error = ref('');
const success = ref('');

// Platform basic info
const platformInfo = ref({
  name: '',
  category: '',
  description: '',
  slug: ''
});

const platformCategories = [
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'education', label: 'Education' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'other', label: 'Other' }
];

// Auto-generate slug from name
const generateSlug = () => {
  if (platformInfo.value.name) {
    platformInfo.value.slug = platformInfo.value.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
};

// Define a proper interface for the API response
interface CreatePlatformResponse {
  success: boolean;
  message?: string;
  platform?: any;
}

// Platform creation

const createPlatform = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    generateSlug();
    
    // Prepare platform data
    const platformData = {
      ...platformInfo.value
    };

    const response = await $fetch<CreatePlatformResponse>('/api/platform-admin/platforms', {
      method: 'POST',
      credentials: 'include',
      body: platformData
    });

    if (response.success) {
      success.value = response.message || 'Platform created successfully!';
      setTimeout(() => {
        // Navigate based on user's actual role, not assume they become platform admin
        if (authStore.user?.role === 'super_admin') {
          router.push('/superadmin/platforms');
        } else {
          router.push('/platform');
        }
      }, 2000);
    } else {
      error.value = response.message || 'Failed to create platform';
    }
  } catch (err: any) {
    console.error('Error creating platform:', err);
    error.value = err.data?.message || 'Failed to create platform';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Create New Platform</h1>
        <p class="text-gray-600 mt-2">Set up a new platform</p>
      </div>



      <!-- Alert Messages -->
      <div v-if="success" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span class="text-green-800">{{ success }}</span>
        </div>
      </div>

      <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <span class="text-red-800">{{ error }}</span>
        </div>
      </div>

      <!-- Platform Form -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Platform Information</h2>
        
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Platform Name *</label>
            <input
              v-model="platformInfo.name"
              @input="generateSlug"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Hotel Booking Platform"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Platform Slug</label>
            <input
              v-model="platformInfo.slug"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              placeholder="auto-generated-from-name"
              readonly
            />
            <p class="text-sm text-gray-500 mt-1">This will be used in URLs and must be unique</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Platform Category *</label>
            <select
              v-model="platformInfo.category"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select platform category</option>
              <option v-for="cat in platformCategories" :key="cat.value" :value="cat.value">
                {{ cat.label }}
              </option>
            </select>
            <p class="text-sm text-gray-500 mt-1">This determines which organization types will be available</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              v-model="platformInfo.description"
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the purpose and scope of this platform..."
              required
            ></textarea>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end mt-8 pt-6 border-t border-gray-200">
          <div class="flex space-x-3">
            <button
              @click="router.push('/platform')"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>

            <button
              @click="createPlatform"
              :disabled="loading || !platformInfo.name || !platformInfo.category || !platformInfo.description"
              class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Creating Platform...' : 'Create Platform' }}
            </button>
          </div>
        </div>

      
      </div>
    </div>
  </div>
</template>