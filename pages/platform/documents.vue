<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="md:flex md:items-center md:justify-between mb-6">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Platform Documents
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            Manage platform-wide documents and configurations
          </p>
        </div>
        <div class="mt-4 flex md:mt-0 md:ml-4">
          <button
            @click="showConfigModal = true"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Document Types
          </button>
          <button
            @click="showUploadModal = true"
            class="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Upload Document
          </button>
        </div>
      </div>

      <!-- Platform-wide Stats -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m-5 0h6M15 11l-3-3-3 3"></path>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Platform Documents</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ platformStats.platform }}</dd>
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
                  <dt class="text-sm font-medium text-gray-500 truncate">Organization Documents</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ platformStats.organization }}</dd>
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">User Documents</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ platformStats.user }}</dd>
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Pending Review</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ platformStats.pending }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Layer Filter -->
      <div class="bg-white shadow rounded-lg mb-6">
        <div class="p-6">
          <div class="flex items-center space-x-4">
            <label class="text-sm font-medium text-gray-700">View documents by layer:</label>
            <div class="flex space-x-2">
              <button
                v-for="layer in ['all', 'platform', 'organization', 'user']"
                :key="layer"
                @click="selectedLayer = layer"
                class="px-3 py-2 text-sm font-medium rounded-md transition-colors"
                :class="selectedLayer === layer 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              >
                {{ layer.charAt(0).toUpperCase() + layer.slice(1) }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Document Manager -->
      <DocumentManager
        :layer="selectedLayer === 'all' ? '' : selectedLayer"
        :user-role="user?.role"
        :user-id="user?.id"
        :organization-id="user?.organizationId"
        @document-updated="loadStats"
        @document-deleted="loadStats"
      />

      <!-- Upload Modal -->
      <div
        v-if="showUploadModal"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        @click="closeUploadModal"
      >
        <div class="relative top-20 mx-auto p-5 border max-w-2xl shadow-lg rounded-md bg-white" @click.stop>
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Upload Platform Document</h3>
            <DocumentUploader
              :available-doc-types="documentTypes"
              layer="platform"
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

      <!-- Document Types Config Modal -->
      <div
        v-if="showConfigModal"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        @click="closeConfigModal"
      >
        <div class="relative top-20 mx-auto p-5 border max-w-4xl shadow-lg rounded-md bg-white" @click.stop>
          <div class="mt-3">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">Document Type Configuration</h3>
              <button
                @click="seedDocumentTypes"
                class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
              >
                Seed Defaults
              </button>
            </div>
            <div class="max-h-96 overflow-y-auto">
              <div class="space-y-4">
                <div
                  v-for="docType in documentTypes"
                  :key="docType.key"
                  class="border border-gray-200 rounded-lg p-4"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <h4 class="font-medium text-gray-900">{{ docType.name }}</h4>
                      <p class="text-sm text-gray-600">{{ docType.description }}</p>
                      <div class="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span class="capitalize">Layer: {{ docType.layer }}</span>
                        <span :class="docType.required ? 'text-red-600' : 'text-blue-600'">
                          {{ docType.required ? 'Required' : 'Optional' }}
                        </span>
                        <span v-if="docType.maxSize">Max: {{ formatFileSize(docType.maxSize) }}</span>
                      </div>
                    </div>
                    <span 
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="docType.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                    >
                      {{ docType.active ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-6 flex justify-end">
              <button
                @click="closeConfigModal"
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
  middleware: ['auth', 'role'],
  roles: ['platform_admin']
});

// Components
import DocumentManager from '~/components/DocumentManager.vue';
import DocumentUploader from '~/components/DocumentUploader.vue';

// Auth
// Include cookies when fetching auth info. On server-side, forward the incoming cookie header.
const requestHeaders = process.server ? useRequestHeaders(['cookie']) : undefined;
const authResponse = await $fetch<{ user: { _id: string; role: string; organizationId?: string } | null }>(
  '/api/auth/user',
  { credentials: 'include', headers: requestHeaders }
);
const rawUser = authResponse?.user ?? null;
// Normalize user shape for templates/components (use `id` instead of `_id`).
const user = rawUser
  ? { id: rawUser._id as string, role: rawUser.role as string, organizationId: rawUser.organizationId as string | undefined }
  : null;

// Types
interface DocumentType {
  key: string;
  name: string;
  layer: string;
  required: boolean;
  description: string;
  maxSize?: number;
  allowedMimeTypes?: string[];
  active: boolean;
}

// Reactive state
const showUploadModal = ref(false);
const showConfigModal = ref(false);
const selectedLayer = ref('all');
const documentTypes = ref<DocumentType[]>([]);
const platformStats = ref({
  platform: 0,
  organization: 0,
  user: 0,
  pending: 0
});

// Lifecycle
onMounted(() => {
  loadDocumentTypes();
  loadStats();
});

// Methods
const loadDocumentTypes = async () => {
  try {
    const response = await $fetch<{ documentTypes: DocumentType[] }>('/api/admin/document-types/list?layer=platform', {
      credentials: 'include'
    });
    documentTypes.value = response.documentTypes || [];
  } catch (error) {
    console.error('Failed to load document types:', error);
    // Fallback to hardcoded types if API fails
    documentTypes.value = [
      { 
        key: 'platform_agreement', 
        name: 'Platform Agreement', 
        layer: 'platform',
        required: true, 
        description: 'Platform legal agreement document',
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: ['application/pdf'],
        active: true
      }
    ];
  }
};

const loadStats = async () => {
  try {
    const response = await $fetch<{ documents: any[] }>('/api/documents/list');
    const documents = response.documents || [];
    
    platformStats.value = {
      platform: documents.filter(d => d.layer === 'platform').length,
      organization: documents.filter(d => d.layer === 'organization').length,
      user: documents.filter(d => d.layer === 'user').length,
      pending: documents.filter(d => d.status === 'pending').length
    };
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
};

const seedDocumentTypes = async () => {
  try {
    await $fetch('/api/documents/seed', { method: 'POST' });
    alert('Default document types have been seeded successfully!');
    loadDocumentTypes();
  } catch (error: any) {
    console.error('Failed to seed document types:', error);
    alert(error.data?.message || 'Failed to seed document types');
  }
};

const closeUploadModal = () => {
  showUploadModal.value = false;
};

const closeConfigModal = () => {
  showConfigModal.value = false;
};

const onDocumentUploaded = (document: any) => {
  closeUploadModal();
  loadStats();
};

const onUploadError = (error: string) => {
  console.error('Upload error:', error);
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>