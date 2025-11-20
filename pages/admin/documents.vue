<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="md:flex md:items-center md:justify-between mb-6">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Document Management
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            Manage documents across all organizations and platforms
          </p>
        </div>
        <div class="mt-4 flex md:mt-0 md:ml-4">
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

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Documents</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.total }}</dd>
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
                  <dt class="text-sm font-medium text-gray-500 truncate">Pending Approval</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.pending }}</dd>
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Approved</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.approved }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.rejected }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Document Manager -->
      <DocumentManager
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
            <h3 class="text-lg font-medium text-gray-900 mb-4">Upload New Document</h3>
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
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth-guard'],
  roles: ['super_admin', 'platform_admin', 'admin']
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

// Reactive state
const showUploadModal = ref(false);
const documentTypes = ref<Array<{
  key: string;
  name: string;
  required: boolean;
  description: string;
}>>([]);
const stats = ref({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0
});

// Lifecycle
onMounted(() => {
  loadDocumentTypes();
  loadStats();
});

// Methods
const loadDocumentTypes = async () => {
  try {
    const response = await $fetch<{ documentTypes: Array<{
      key: string;
      name: string;
      required: boolean;
      description: string;
    }> }>('/api/admin/document-types/list', {
      credentials: 'include'
    });
    documentTypes.value = response.documentTypes || [];
  } catch (error) {
    console.error('Failed to load document types:', error);
    // Fallback to placeholder data if API fails
    documentTypes.value = [
      { key: 'platform_agreement', name: 'Platform Agreement', required: true, description: 'Platform legal agreement' },
      { key: 'platform_cert', name: 'Platform Certificate', required: false, description: 'Platform certification document' }
    ];
  }
};

const loadStats = async () => {
  try {
    const response = await $fetch<{ documents: Array<{ status: string }> }>('/api/documents/list');
    const documents = response.documents || [];
    
    stats.value = {
      total: documents.length,
      pending: documents.filter(d => d.status === 'pending').length,
      approved: documents.filter(d => d.status === 'approved').length,
      rejected: documents.filter(d => d.status === 'rejected').length
    };
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
};

const closeUploadModal = () => {
  showUploadModal.value = false;
};

const onDocumentUploaded = (document: any) => {
  closeUploadModal();
  loadStats();
  // You might want to refresh the document list here
};

const onUploadError = (error: string) => {
  console.error('Upload error:', error);
  // Handle upload error (show notification, etc.)
};
</script>