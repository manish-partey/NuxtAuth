<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="md:flex md:items-center md:justify-between mb-6">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Document Requirements
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            Manage document requirements for your organization: {{ organizationData?.name }}
          </p>
        </div>
        <div class="mt-4 flex md:mt-0 md:ml-4">
          <NuxtLink 
            to="/org/documents"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            All Documents
          </NuxtLink>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-800">{{ error }}</p>
        <button @click="loadRequirements" class="mt-2 text-sm text-red-600 hover:text-red-800 underline">
          Try Again
        </button>
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- Overview Stats -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <!-- Organization Documents Progress -->
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
                    <dt class="text-sm font-medium text-gray-500 truncate">Organization Documents</dt>
                    <dd class="text-lg font-medium text-gray-900">
                      {{ stats?.organization?.completed || 0 }}/{{ stats?.organization?.total || 0 }}
                    </dd>
                    <dd class="text-xs text-blue-600">Complete</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- Required Completed -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Required Documents</dt>
                    <dd class="text-lg font-medium text-gray-900">
                      {{ stats?.organization?.requiredCompleted || 0 }}/{{ stats?.organization?.required || 0 }}
                    </dd>
                    <dd class="text-xs text-red-600">Mandatory</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- User Document Types -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">User Document Types</dt>
                    <dd class="text-lg font-medium text-gray-900">
                      {{ userRequirements?.required?.length || 0 }} + {{ userRequirements?.optional?.length || 0 }}
                    </dd>
                    <dd class="text-xs text-green-600">Required + Optional</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- Completion Rate -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-8 w-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Completion Rate</dt>
                    <dd class="text-lg font-medium text-gray-900">
                      {{ completionPercentage }}%
                    </dd>
                    <dd class="text-xs text-purple-600">Organization Setup</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Organization Document Requirements -->
        <div class="bg-white shadow rounded-lg mb-8">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-medium text-gray-900">Organization Registration Documents</h3>
                <p class="mt-1 text-sm text-gray-500">Documents required for your organization: <strong>{{ organizationData?.name }}</strong></p>
              </div>
              <button
                @click="showUploadModal = true"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Upload Document
              </button>
            </div>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Required Organization Documents -->
              <div>
                <div class="flex items-center mb-4">
                  <svg class="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  <h4 class="text-lg font-medium text-gray-900">Required Documents</h4>
                  <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Mandatory
                  </span>
                </div>
                <div v-if="organizationData?.required?.length > 0" class="space-y-4">
                  <div 
                    v-for="docType in organizationData.required" 
                    :key="docType.key"
                    class="border border-red-200 rounded-lg p-4 bg-red-50"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <h5 class="text-sm font-medium text-gray-900">{{ docType.name }}</h5>
                        <p v-if="docType.description" class="text-xs text-gray-600 mt-1">{{ docType.description }}</p>
                        <div class="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <span v-if="docType.maxSize">Max Size: {{ formatFileSize(docType.maxSize) }}</span>
                          <span v-if="docType.allowedMimeTypes?.length">
                            Types: {{ docType.allowedMimeTypes.join(', ') }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <span 
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="getDocumentStatusClass(docType)"
                        >
                          {{ getDocumentStatusText(docType) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-8">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <p class="mt-2 text-sm text-gray-500">No required organization documents configured.</p>
                  <p class="text-xs text-gray-400">Contact platform admin to set up required documents.</p>
                </div>
              </div>

              <!-- Optional Organization Documents -->
              <div>
                <div class="flex items-center mb-4">
                  <svg class="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <h4 class="text-lg font-medium text-gray-900">Optional Documents</h4>
                  <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Optional
                  </span>
                </div>
                <div v-if="organizationData?.optional?.length > 0" class="space-y-4">
                  <div 
                    v-for="docType in organizationData.optional" 
                    :key="docType.key"
                    class="border border-blue-200 rounded-lg p-4 bg-blue-50"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <h5 class="text-sm font-medium text-gray-900">{{ docType.name }}</h5>
                        <p v-if="docType.description" class="text-xs text-gray-600 mt-1">{{ docType.description }}</p>
                        <div class="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <span v-if="docType.maxSize">Max Size: {{ formatFileSize(docType.maxSize) }}</span>
                          <span v-if="docType.allowedMimeTypes?.length">
                            Types: {{ docType.allowedMimeTypes.join(', ') }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <span 
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="getDocumentStatusClass(docType)"
                        >
                          {{ getDocumentStatusText(docType) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-8">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <p class="mt-2 text-sm text-gray-500">No optional organization documents available.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Document Requirements -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-medium text-gray-900">User Registration Requirements</h3>
                <p class="mt-1 text-sm text-gray-500">Documents required when users join your organization</p>
              </div>
            </div>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Required User Documents -->
              <div>
                <h4 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <svg class="h-4 w-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01"></path>
                  </svg>
                  Required for Users
                </h4>
                <div v-if="userRequirements?.required?.length > 0" class="space-y-3">
                  <div 
                    v-for="docType in userRequirements.required" 
                    :key="docType.key"
                    class="flex items-center justify-between p-3 border border-red-200 rounded-md bg-red-50"
                  >
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ docType.name }}</p>
                      <p v-if="docType.description" class="text-xs text-gray-600">{{ docType.description }}</p>
                      <p v-if="docType.maxSize" class="text-xs text-gray-500">Max: {{ formatFileSize(docType.maxSize) }}</p>
                    </div>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Required
                    </span>
                  </div>
                </div>
                <p v-else class="text-sm text-gray-500 italic">No required documents set for users.</p>
              </div>

              <!-- Optional User Documents -->
              <div>
                <h4 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <svg class="h-4 w-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01"></path>
                  </svg>
                  Optional for Users
                </h4>
                <div v-if="userRequirements?.optional?.length > 0" class="space-y-3">
                  <div 
                    v-for="docType in userRequirements.optional" 
                    :key="docType.key"
                    class="flex items-center justify-between p-3 border border-blue-200 rounded-md bg-blue-50"
                  >
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ docType.name }}</p>
                      <p v-if="docType.description" class="text-xs text-gray-600">{{ docType.description }}</p>
                      <p v-if="docType.maxSize" class="text-xs text-gray-500">Max: {{ formatFileSize(docType.maxSize) }}</p>
                    </div>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Optional
                    </span>
                  </div>
                </div>
                <p v-else class="text-sm text-gray-500 italic">No optional documents available for users.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Upload Modal -->
      <div
        v-if="showUploadModal"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        @click="closeUploadModal"
      >
        <div class="relative top-20 mx-auto p-5 border max-w-2xl shadow-lg rounded-md bg-white" @click.stop>
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Upload Organization Document</h3>
            <DocumentUploader
              :available-doc-types="availableDocTypes"
              layer="organization"
              :layer-id="organizationData?.id"
              @uploaded="onDocumentUploaded"
              @error="onUploadError"
            />
            <div class="mt-4 flex justify-end">
              <button
                @click="closeUploadModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth-guard'],
  roles: ['organization_admin']
});

// Components
import DocumentUploader from '~/components/DocumentUploader.vue';

// Reactive state
const loading = ref(true);
const error = ref('');
const showUploadModal = ref(false);
const organizationData = ref<any>(null);
const userRequirements = ref<any>(null);
const stats = ref<any>(null);

// Computed
const availableDocTypes = computed(() => {
  if (!organizationData.value) return [];
  return [...(organizationData.value.required || []), ...(organizationData.value.optional || [])];
});

const completionPercentage = computed(() => {
  if (!stats.value?.organization?.total) return 0;
  return Math.round((stats.value.organization.completed / stats.value.organization.total) * 100);
});

// Lifecycle
onMounted(() => {
  loadRequirements();
});

// Methods
const loadRequirements = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const response = await $fetch('/api/organization/document-requirements', {
      credentials: 'include'
    });
    
    if (response.success) {
      organizationData.value = response.organization;
      userRequirements.value = response.userRequirements;
      stats.value = response.stats;
    }
  } catch (err: any) {
    console.error('Failed to load document requirements:', err);
    error.value = err.data?.message || 'Failed to load document requirements';
  } finally {
    loading.value = false;
  }
};

const getDocumentStatusClass = (docType: any): string => {
  const isUploaded = organizationData.value?.uploaded?.some((up: any) => up.key === docType.key);
  if (isUploaded) {
    return 'bg-green-100 text-green-800';
  }
  return docType.required 
    ? 'bg-red-100 text-red-800' 
    : 'bg-gray-100 text-gray-800';
};

const getDocumentStatusText = (docType: any): string => {
  const uploadedDoc = organizationData.value?.uploaded?.find((up: any) => up.key === docType.key);
  if (uploadedDoc) {
    return uploadedDoc.status === 'approved' ? 'Approved' : 
           uploadedDoc.status === 'pending' ? 'Pending' : 
           uploadedDoc.status === 'rejected' ? 'Rejected' : 'Uploaded';
  }
  return docType.required ? 'Required' : 'Optional';
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const closeUploadModal = () => {
  showUploadModal.value = false;
};

const onDocumentUploaded = (document: any) => {
  closeUploadModal();
  loadRequirements(); // Reload to show updated status
};

const onUploadError = (error: string) => {
  console.error('Upload error:', error);
};
</script>