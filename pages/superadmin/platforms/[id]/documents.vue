<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header with Navigation -->
      <div class="mb-6">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-4">
            <li>
              <div>
                <NuxtLink to="/superadmin/platforms" class="text-gray-400 hover:text-gray-500">
                  <svg class="flex-shrink-0 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m-5 0h6M7 11l3-3 3 3"></path>
                  </svg>
                  <span class="sr-only">Platforms</span>
                </NuxtLink>
              </div>
            </li>
            <li>
              <div class="flex items-center">
                <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
                <NuxtLink to="/superadmin/platforms" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Platforms
                </NuxtLink>
              </div>
            </li>
            <li>
              <div class="flex items-center">
                <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="ml-4 text-sm font-medium text-gray-500">{{ platform?.name || 'Loading...' }}</span>
              </div>
            </li>
            <li>
              <div class="flex items-center">
                <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="ml-4 text-sm font-medium text-gray-900">Document Requirements</span>
              </div>
            </li>
          </ol>
        </nav>
        
        <div class="mt-4 md:flex md:items-center md:justify-between">
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {{ platform?.name }} - Document Requirements
            </h2>
            <p class="mt-1 text-sm text-gray-500">
              Configure required and optional documents for this platform
            </p>
          </div>
          <div class="mt-4 flex md:mt-0 md:ml-4">
            <button
              @click="showAddDocumentModal = true"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Document Type
            </button>
          </div>
        </div>
      </div>

      <!-- Document Requirements -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Required Documents -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900 text-red-600">Required Documents</h3>
            <p class="mt-1 text-sm text-gray-500">Documents that must be uploaded by this platform</p>
          </div>
          <div class="p-6">
            <div v-if="requiredDocuments.length === 0" class="text-center text-gray-500 py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.712-3.714M14 40v-4a9.971 9.971 0 01.712-3.714M18 20a6 6 0 11-12 0 6 6 0 0112 0zm-6 16a4 4 0 11-8 0 4 4 0 018 0zm6-16a6 6 0 11-12 0 6 6 0 0112 0zm-6 16a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No required documents</h3>
              <p class="mt-1 text-sm text-gray-500">Get started by adding a required document type.</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="doc in requiredDocuments"
                :key="doc._id"
                class="border border-red-200 rounded-lg p-4 bg-red-50"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h4 class="text-sm font-medium text-gray-900">{{ doc.name }}</h4>
                    <p class="text-sm text-gray-600">{{ doc.description }}</p>
                    <div class="mt-1 flex items-center space-x-3 text-xs text-gray-500">
                      <span>Layer: {{ doc.layer }}</span>
                      <span v-if="doc.maxSize">Max size: {{ formatFileSize(doc.maxSize) }}</span>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Required
                    </span>
                    <button
                      @click="toggleDocumentRequirement(doc, false)"
                      class="text-gray-400 hover:text-gray-600"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                      </svg>
                    </button>
                    <button
                      @click="deleteDocumentType(doc)"
                      class="text-red-400 hover:text-red-600"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Optional Documents -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900 text-blue-600">Optional Documents</h3>
            <p class="mt-1 text-sm text-gray-500">Documents that can be optionally uploaded</p>
          </div>
          <div class="p-6">
            <div v-if="optionalDocuments.length === 0" class="text-center text-gray-500 py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.712-3.714M14 40v-4a9.971 9.971 0 01.712-3.714M18 20a6 6 0 11-12 0 6 6 0 0112 0zm-6 16a4 4 0 11-8 0 4 4 0 018 0zm6-16a6 6 0 11-12 0 6 6 0 0112 0zm-6 16a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No optional documents</h3>
              <p class="mt-1 text-sm text-gray-500">Add optional document types for flexibility.</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="doc in optionalDocuments"
                :key="doc._id"
                class="border border-blue-200 rounded-lg p-4 bg-blue-50"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h4 class="text-sm font-medium text-gray-900">{{ doc.name }}</h4>
                    <p class="text-sm text-gray-600">{{ doc.description }}</p>
                    <div class="mt-1 flex items-center space-x-3 text-xs text-gray-500">
                      <span>Layer: {{ doc.layer }}</span>
                      <span v-if="doc.maxSize">Max size: {{ formatFileSize(doc.maxSize) }}</span>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Optional
                    </span>
                    <button
                      @click="toggleDocumentRequirement(doc, true)"
                      class="text-gray-400 hover:text-gray-600"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                      </svg>
                    </button>
                    <button
                      @click="deleteDocumentType(doc)"
                      class="text-red-400 hover:text-red-600"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Document Type Modal -->
      <div
        v-if="showAddDocumentModal"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        @click="closeAddDocumentModal"
      >
        <div class="relative top-20 mx-auto p-5 border max-w-md shadow-lg rounded-md bg-white" @click.stop>
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Add Document Type</h3>
            <form @submit.prevent="addDocumentType">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Document Name</label>
                  <input
                    v-model="newDocument.name"
                    type="text"
                    required
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., Hotel Platform License"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Key (Auto-generated)</label>
                  <input
                    :value="generateKey(newDocument.name)"
                    type="text"
                    readonly
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    v-model="newDocument.description"
                    rows="2"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Describe the document requirements..."
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Requirement Type</label>
                  <select
                    v-model="newDocument.required"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option :value="true">Required</option>
                    <option :value="false">Optional</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Layer</label>
                  <select
                    v-model="newDocument.layer"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="platform">Platform</option>
                    <option value="organization">Organization</option>
                    <option value="user">User</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Max File Size (MB)</label>
                  <input
                    v-model.number="newDocument.maxSize"
                    type="number"
                    min="1"
                    max="50"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="5"
                  />
                </div>
              </div>

              <div class="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  @click="closeAddDocumentModal"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="isAddingDocument"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {{ isAddingDocument ? 'Adding...' : 'Add Document Type' }}
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
  middleware: ['auth', 'role'],
  roles: ['super_admin']
});

// Get platform ID from route
const route = useRoute();
const platformId = route.params.id as string;

// Types
interface DocumentType {
  _id: string;
  name: string;
  key: string;
  description: string;
  layer: 'platform' | 'organization' | 'user';
  required: boolean;
  maxSize: number;
  active: boolean;
}

interface Platform {
  _id: string;
  name: string;
  description: string;
}

interface SuccessfulPlatformResponse {
  success: true;
  platform: Platform;
}

interface ErrorPlatformResponse {
  success: false;
  message: string;
}

type PlatformResponse = SuccessfulPlatformResponse | ErrorPlatformResponse;

interface DocumentTypesResponse {
  success: boolean;
  documentTypes?: DocumentType[];
  message?: string;
}

// Reactive state
const platform = ref<Platform | null>(null);
const documentTypes = ref<DocumentType[]>([]);
const showAddDocumentModal = ref(false);
const isAddingDocument = ref(false);
const newDocument = ref({
  name: '',
  description: '',
  layer: 'platform' as 'platform' | 'organization' | 'user',
  required: true,
  maxSize: 5
});

// Computed properties
const requiredDocuments = computed(() => 
  documentTypes.value.filter(doc => doc.required && doc.active)
);

const optionalDocuments = computed(() => 
  documentTypes.value.filter(doc => !doc.required && doc.active)
);

// Methods
const loadPlatform = async () => {
  try {
    const response = await $fetch<PlatformResponse>(`/api/superadmin/platforms/${platformId}`, {
      credentials: 'include'
    });
    
    if (response.success) {
      // Type guard: if success is true, then platform exists
      platform.value = response.platform;
    } else {
      console.error('Platform not found:', response.message);
      platform.value = null;
    }
  } catch (error) {
    console.error('Failed to load platform:', error);
    // Fallback: create a basic platform object from the route
    platform.value = {
      _id: platformId,
      name: 'Platform',
      description: 'Loading platform details...'
    };
  }
};

const loadDocumentTypes = async () => {
  try {
    const response = await $fetch<DocumentTypesResponse>(`/api/superadmin/platforms/${platformId}/document-types`, {
      credentials: 'include'
    });
    documentTypes.value = response.documentTypes || [];
  } catch (error) {
    console.error('Failed to load document types:', error);
    documentTypes.value = [];
  }
};

const addDocumentType = async () => {
  isAddingDocument.value = true;
  try {
    const documentData = {
      ...newDocument.value,
      key: generateKey(newDocument.value.name),
      maxSize: newDocument.value.maxSize * 1024 * 1024, // Convert MB to bytes
      allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      active: true,
      platformId
    };

    await $fetch(`/api/superadmin/platforms/${platformId}/document-types`, {
      method: 'POST',
      credentials: 'include',
      body: documentData
    });

    alert('Document type added successfully!');
    closeAddDocumentModal();
    loadDocumentTypes();
  } catch (error: any) {
    console.error('Failed to add document type:', error);
    alert(error.data?.message || 'Failed to add document type');
  } finally {
    isAddingDocument.value = false;
  }
};

const toggleDocumentRequirement = async (doc: DocumentType, required: boolean) => {
  try {
    await $fetch(`/api/superadmin/platforms/${platformId}/document-types/${doc._id}`, {
      method: 'PATCH',
      credentials: 'include',
      body: { required }
    });
    
    loadDocumentTypes();
  } catch (error) {
    console.error('Failed to update document requirement:', error);
  }
};

const deleteDocumentType = async (doc: DocumentType) => {
  if (!confirm(`Are you sure you want to delete "${doc.name}"?`)) return;
  
  try {
    await $fetch(`/api/superadmin/platforms/${platformId}/document-types/${doc._id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    loadDocumentTypes();
  } catch (error) {
    console.error('Failed to delete document type:', error);
  }
};

const generateKey = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .trim();
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const closeAddDocumentModal = () => {
  showAddDocumentModal.value = false;
  newDocument.value = {
    name: '',
    description: '',
    layer: 'platform',
    required: true,
    maxSize: 5
  };
};

// Lifecycle
onMounted(() => {
  loadPlatform();
  loadDocumentTypes();
});
</script>