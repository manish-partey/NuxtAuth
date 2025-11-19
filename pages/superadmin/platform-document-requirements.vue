<template>
  <div class="container mx-auto px-4 py-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Platform Document Requirements</h1>
      <p class="mt-2 text-gray-600">Manage document requirements for platform registration</p>
    </div>

    <!-- Platform Selection -->
    <div class="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Select Platform</h2>
      <select 
        v-model="selectedPlatformId" 
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        @change="loadPlatformRequirements"
      >
        <option value="">Select a platform...</option>
        <option v-for="platform in platforms" :key="platform.id" :value="platform.id">
          {{ platform.name }} ({{ platform.type }})
        </option>
      </select>
    </div>

    <!-- Document Requirements Management -->
    <div v-if="selectedPlatform" class="space-y-6">
      <!-- Platform Info -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 class="text-xl font-semibold text-blue-900 mb-2">{{ selectedPlatform.name }}</h2>
        <p class="text-blue-700">Type: {{ selectedPlatform.type }}</p>
      </div>

      <!-- Platform Documents -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Platform Registration Documents</h3>
        <div v-if="selectedPlatform.documentTypes.platform.length > 0" class="space-y-4">
          <div 
            v-for="docType in selectedPlatform.documentTypes.platform" 
            :key="docType.id"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-medium text-gray-900">{{ docType.name }}</h4>
              <div class="flex items-center space-x-2">
                <span 
                  class="text-sm px-2 py-1 rounded"
                  :class="docType.finalRequired ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'"
                >
                  {{ docType.finalRequired ? 'Required' : 'Optional' }}
                </span>
                <button
                  @click="toggleRequirement(docType, 'platform')"
                  :disabled="loading"
                  class="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                >
                  Toggle
                </button>
              </div>
            </div>
            <p class="text-sm text-gray-600 mb-2">{{ docType.description }}</p>
            <div class="text-xs text-gray-500">
              <span v-if="docType.customRequired !== null">
                Custom setting: {{ docType.customRequired ? 'Required' : 'Optional' }} 
                (set {{ formatDate(docType.setAt) }})
              </span>
              <span v-else>
                Default: {{ docType.defaultRequired ? 'Required' : 'Optional' }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          No platform documents configured
        </div>
      </div>

      <!-- Organization Documents -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Organization Registration Documents</h3>
        <div v-if="selectedPlatform.documentTypes.organization.length > 0" class="space-y-4">
          <div 
            v-for="docType in selectedPlatform.documentTypes.organization" 
            :key="docType.id"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-medium text-gray-900">{{ docType.name }}</h4>
              <div class="flex items-center space-x-2">
                <span 
                  class="text-sm px-2 py-1 rounded"
                  :class="docType.finalRequired ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'"
                >
                  {{ docType.finalRequired ? 'Required' : 'Optional' }}
                </span>
                <button
                  @click="toggleRequirement(docType, 'organization')"
                  :disabled="loading"
                  class="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                >
                  Toggle
                </button>
              </div>
            </div>
            <p class="text-sm text-gray-600 mb-2">{{ docType.description }}</p>
            <div class="text-xs text-gray-500">
              <span v-if="docType.customRequired !== null">
                Custom setting: {{ docType.customRequired ? 'Required' : 'Optional' }} 
                (set {{ formatDate(docType.setAt) }})
              </span>
              <span v-else>
                Default: {{ docType.defaultRequired ? 'Required' : 'Optional' }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          No organization documents configured
        </div>
      </div>

      <!-- User Documents -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">User Registration Documents</h3>
        <div v-if="selectedPlatform.documentTypes.user.length > 0" class="space-y-4">
          <div 
            v-for="docType in selectedPlatform.documentTypes.user" 
            :key="docType.id"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-medium text-gray-900">{{ docType.name }}</h4>
              <div class="flex items-center space-x-2">
                <span 
                  class="text-sm px-2 py-1 rounded"
                  :class="docType.finalRequired ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'"
                >
                  {{ docType.finalRequired ? 'Required' : 'Optional' }}
                </span>
                <button
                  @click="toggleRequirement(docType, 'user')"
                  :disabled="loading"
                  class="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                >
                  Toggle
                </button>
              </div>
            </div>
            <p class="text-sm text-gray-600 mb-2">{{ docType.description }}</p>
            <div class="text-xs text-gray-500">
              <span v-if="docType.customRequired !== null">
                Custom setting: {{ docType.customRequired ? 'Required' : 'Optional' }} 
                (set {{ formatDate(docType.setAt) }})
              </span>
              <span v-else>
                Default: {{ docType.defaultRequired ? 'Required' : 'Optional' }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          No user documents configured
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="message" class="mt-6 p-4 rounded-lg" :class="messageType === 'error' ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-green-50 border border-green-200 text-green-800'">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Layout
definePageMeta({
  layout: 'admin'
});

// Reactive data
const platforms = ref<any[]>([]);
const selectedPlatformId = ref('');
const selectedPlatform = ref<any>(null);
const loading = ref(false);
const message = ref('');
const messageType = ref('success');

// Load platforms on component mount
onMounted(async () => {
  await loadPlatforms();
});

const loadPlatforms = async () => {
  try {
    loading.value = true;
    const response = await $fetch('/api/superadmin/platform-document-requirements') as any;
    if (response.success && response.platforms) {
      platforms.value = response.platforms;
    }
  } catch (error: any) {
    showMessage(error.data?.message || 'Failed to load platforms', 'error');
  } finally {
    loading.value = false;
  }
};

const loadPlatformRequirements = async () => {
  if (!selectedPlatformId.value) {
    selectedPlatform.value = null;
    return;
  }

  try {
    loading.value = true;
    const response = await $fetch(`/api/superadmin/platform-document-requirements?platformId=${selectedPlatformId.value}`) as any;
    if (response.success && response.platform) {
      selectedPlatform.value = response.platform;
    }
  } catch (error: any) {
    showMessage(error.data?.message || 'Failed to load platform requirements', 'error');
  } finally {
    loading.value = false;
  }
};

const toggleRequirement = async (docType: any, layer: string) => {
  try {
    loading.value = true;
    const newRequired = !docType.finalRequired;
    
    const response = await $fetch('/api/superadmin/platform-document-requirements', {
      method: 'POST',
      body: {
        platformId: selectedPlatformId.value,
        documentTypeId: docType.id,
        required: newRequired,
        action: 'set'
      }
    });

    if (response.success) {
      // Update the local data
      docType.customRequired = newRequired;
      docType.finalRequired = newRequired;
      docType.setAt = new Date();
      
      showMessage(`Document requirement updated successfully`, 'success');
    }
  } catch (error: any) {
    showMessage(error.data?.message || 'Failed to update document requirement', 'error');
  } finally {
    loading.value = false;
  }
};

const showMessage = (msg: string, type: 'success' | 'error') => {
  message.value = msg;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 5000);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};
</script>