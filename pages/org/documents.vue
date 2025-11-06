<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="md:flex md:items-center md:justify-between mb-6">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Organization Documents
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            Manage documents for your organization
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
              <p v-else class="text-sm text-gray-500">No required documents for your organization.</p>
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
        layer="organization"
        :layer-id="user?.organizationId"
        :user-role="user?.role"
        :user-id="user?.id"
        :organization-id="user?.organizationId"
        @document-updated="loadDocuments"
        @document-deleted="loadDocuments"
      />

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
              :available-doc-types="documentTypes"
              layer="organization"
              :layer-id="user?.organizationId"
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
  middleware: ['auth', 'role'],
  roles: ['organization_admin', 'user']
});

// Components
import DocumentManager from '~/components/DocumentManager.vue';
import DocumentUploader from '~/components/DocumentUploader.vue';

// Types
interface DocumentType {
  key: string;
  name: string;
  required: boolean;
  description?: string;
  maxSize?: number;
  allowedMimeTypes?: string[];
}

interface Document {
  name: string;
  status: string;
}

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
const documentTypes = ref<DocumentType[]>([]);
const documents = ref<Document[]>([]);

// Computed
const requiredDocTypes = computed(() => 
  documentTypes.value.filter(doc => doc.required)
);

const optionalDocTypes = computed(() => 
  documentTypes.value.filter(doc => !doc.required)
);

// Lifecycle
onMounted(() => {
  loadDocumentTypes();
  loadDocuments();
});

// Methods
const loadDocumentTypes = async () => {
  try {
    const response = await $fetch<{ documentTypes: DocumentType[] }>('/api/admin/document-types/list?layer=organization', {
      credentials: 'include'
    });
    documentTypes.value = response.documentTypes || [];
  } catch (error) {
    console.error('Failed to load document types:', error);
    // Fallback to hardcoded types if API fails
    documentTypes.value = [
      { 
        key: 'org_registration', 
        name: 'Organization Registration', 
        required: true, 
        description: 'Legal registration documents for your organization',
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png']
      },
      { 
        key: 'tax_certificate', 
        name: 'Tax Certificate', 
        required: true, 
        description: 'Tax registration certificate',
        maxSize: 5 * 1024 * 1024,
        allowedMimeTypes: ['application/pdf']
      },
      { 
        key: 'business_license', 
        name: 'Business License', 
        required: false, 
        description: 'Business operation license',
        maxSize: 5 * 1024 * 1024,
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png']
      }
    ];
  }
};

const loadDocuments = async () => {
  try {
    if (!user?.organizationId) {
      console.warn('User or organizationId not available for loading documents');
      return;
    }
    const response = await $fetch<{ documents: Document[] }>(`/api/documents/list?layer=organization&layerId=${user.organizationId}`);
    documents.value = response.documents || [];
  } catch (error) {
    console.error('Failed to load documents:', error);
  }
};

const getRequirementStatus = (docType: any): string => {
  const hasDocument = documents.value.some(doc => 
    doc.name === docType.key && ['uploaded', 'approved', 'pending'].includes(doc.status)
  );
  return hasDocument ? 'completed' : 'pending';
};

const closeUploadModal = () => {
  showUploadModal.value = false;
};

const onDocumentUploaded = (document: any) => {
  closeUploadModal();
  loadDocuments();
};

const onUploadError = (error: string) => {
  console.error('Upload error:', error);
  // Handle upload error (show notification, etc.)
};
</script>