<template>
  <div class="max-w-5xl mx-auto py-10 px-4">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-semibold text-gray-800 mb-2">User Dashboard</h1>
        <p class="text-sm text-gray-600">Welcome to your dashboard. View your activities and updates here.</p>
      </div>

      <div class="flex items-center space-x-3">
        <button
          @click="showUploadModal = true"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Upload Document
        </button>
      </div>
    </div>

    <!-- Document Requirements -->
    <div class="bg-white shadow rounded-lg mb-6">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Document Requirements</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Required Documents -->
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-3">Required Documents</h4>
            <div v-if="requiredDocTypes.length > 0" class="space-y-2">
              <div 
                v-for="docType in requiredDocTypes" 
                :key="docType.key"
                class="flex items-center justify-between p-3 border border-red-200 rounded-md bg-red-50"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ docType.name }}</p>
                  <p v-if="docType.description" class="text-xs text-gray-600">{{ docType.description }}</p>
                </div>
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getRequirementStatus(docType) === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ getRequirementStatus(docType) === 'completed' ? 'Completed' : 'Required' }}
                </span>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500">No required documents for you.</p>
          </div>

          <!-- Optional Documents -->
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-3">Optional Documents</h4>
            <div v-if="optionalDocTypes.length > 0" class="space-y-2">
              <div 
                v-for="docType in optionalDocTypes" 
                :key="docType.key"
                class="flex items-center justify-between p-3 border border-blue-200 rounded-md bg-blue-50"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ docType.name }}</p>
                  <p v-if="docType.description" class="text-xs text-gray-600">{{ docType.description }}</p>
                </div>
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getRequirementStatus(docType) === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'"
                >
                  {{ getRequirementStatus(docType) === 'completed' ? 'Uploaded' : 'Optional' }}
                </span>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500">No optional documents available.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Document Manager -->
    <DocumentManager
      layer="user"
      :layer-id="user?.id"
      :user-role="user?.role"
      :user-id="user?.id"
      :organization-id="user?.organizationId"
      @document-updated="loadDocuments"
      @document-deleted="loadDocuments"
    />

    <!-- Toast Notification -->
    <div
      v-if="showToast"
      class="fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
      :class="toastType === 'success' ? 'border-l-4 border-green-400' : 'border-l-4 border-red-400'"
    >
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg v-if="toastType === 'success'" class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div class="ml-3 w-0 flex-1 pt-0.5">
            <p class="text-sm font-medium text-gray-900">{{ toastTitle }}</p>
            <p class="mt-1 text-sm text-gray-500">{{ toastMessage }}</p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button
              @click="hideToast"
              class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span class="sr-only">Close</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
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
          <h3 class="text-lg font-medium text-gray-900 mb-4">Upload Personal Document</h3>
          <DocumentUploader
            :available-doc-types="documentTypes"
            layer="user"
            :layer-id="user?.id"
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
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['user', 'organization_admin', 'platform_admin'],
});

// Components
import DocumentUploader from '~/components/DocumentUploader.vue';
import DocumentManager from '~/components/DocumentManager.vue';

// Auth
const requestHeaders = process.server ? useRequestHeaders(['cookie']) : undefined;
const authResponse = await $fetch<{ user: { _id: string; role: string; organizationId?: string; name?: string } | null }>(
  '/api/auth/user',
  { credentials: 'include', headers: requestHeaders }
);
const rawUser = authResponse?.user ?? null;
const user = rawUser
  ? { id: rawUser._id as string, role: rawUser.role as string, organizationId: rawUser.organizationId as string | undefined, name: rawUser.name as string | undefined }
  : null;

// Reactive state
const showUploadModal = ref(false);
const documentTypes = ref<any[]>([]);
const documents = ref<any[]>([]);

// Toast notification state
const showToast = ref(false);
const toastType = ref<'success' | 'error'>('success');
const toastTitle = ref('');
const toastMessage = ref('');

// Computed
const requiredDocTypes = computed(() => 
  documentTypes.value.filter(doc => doc.required)
);

const optionalDocTypes = computed(() => 
  documentTypes.value.filter(doc => !doc.required)
);

onMounted(() => {
  loadDocumentTypes();
  loadDocuments();
});

const loadDocumentTypes = async () => {
  try {
    const response = await $fetch<{ documentTypes: any[] }>('/api/admin/document-types/list?layer=user', {
      credentials: 'include'
    });
    documentTypes.value = response.documentTypes || [];
  } catch (error) {
    console.error('Failed to load document types:', error);
    documentTypes.value = [];
  }
};

const loadDocuments = async () => {
  try {
    if (!user?.id) {
      console.warn('User ID not available for loading documents');
      return;
    }
    const response = await $fetch<{ documents: any[] }>(`/api/documents/list?layer=user&layerId=${user.id}`, {
      credentials: 'include'
    });
    documents.value = response.documents || [];
  } catch (error) {
    console.error('Failed to load documents:', error);
    documents.value = [];
  }
};

const getRequirementStatus = (docType: any): string => {
  const hasDocument = documents.value.some(doc => 
    doc.name === docType.key && ['uploaded', 'approved', 'pending'].includes(doc.status)
  );
  return hasDocument ? 'completed' : 'pending';
};

// Toast notification methods
const showToastNotification = (type: 'success' | 'error', title: string, message: string) => {
  toastType.value = type;
  toastTitle.value = title;
  toastMessage.value = message;
  showToast.value = true;
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideToast();
  }, 5000);
};

const hideToast = () => {
  showToast.value = false;
};

const closeUploadModal = () => {
  showUploadModal.value = false;
};

const onDocumentUploaded = (document: any) => {
  closeUploadModal();
  loadDocuments();
  
  // Show success toast
  showToastNotification(
    'success',
    'Document Uploaded Successfully',
    `Your document "${document.name}" has been uploaded and is ${document.status === 'pending' ? 'pending approval' : 'ready'}.`
  );
};

const onUploadError = (error: string) => {
  console.error('Upload error:', error);
  
  // Show error toast
  showToastNotification(
    'error',
    'Upload Failed',
    error || 'An error occurred while uploading your document. Please try again.'
  );
};
</script>
