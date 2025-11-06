<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="md:flex md:items-center md:justify-between mb-6">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Document Type Management
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            Configure required and optional documents for each layer
          </p>
        </div>
        <div class="mt-4 flex md:mt-0 md:ml-4">
          <button
            @click="showSeedModal = true"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Seed Defaults
          </button>
          <button
            @click="showCreateModal = true"
            class="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Create Document Type
          </button>
        </div>
      </div>

      <!-- Layer Filter -->
      <div class="bg-white shadow rounded-lg mb-6">
        <div class="p-6">
          <div class="flex items-center space-x-4">
            <label class="text-sm font-medium text-gray-700">Filter by layer:</label>
            <div class="flex space-x-2">
              <button
                v-for="layer in ['all', 'platform', 'organization', 'user']"
                :key="layer"
                @click="selectedLayer = layer; loadDocumentTypes()"
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

      <!-- Document Types Table -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Document Types</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Layer</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Size</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="docType in documentTypes" :key="docType._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ docType.name }}</div>
                    <div v-if="docType.description" class="text-sm text-gray-500">{{ docType.description }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ docType.key }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                    :class="getLayerBadgeClass(docType.layer)">
                    {{ docType.layer }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                    :class="docType.required ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'">
                    {{ docType.required ? 'Required' : 'Optional' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                    :class="docType.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                    {{ docType.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatFileSize(docType.maxSize) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ docType.order || 0 }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    @click="editDocumentType(docType)"
                    class="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteDocumentType(docType)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div v-if="documentTypes.length === 0" class="text-center py-8">
            <p class="text-gray-500">No document types found for the selected layer.</p>
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div
        v-if="showCreateModal || editingDocType"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        @click="closeModal"
      >
        <div class="relative top-20 mx-auto p-5 border max-w-2xl shadow-lg rounded-md bg-white" @click.stop>
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              {{ editingDocType ? 'Edit Document Type' : 'Create Document Type' }}
            </h3>
            
            <form @submit.prevent="saveDocumentType" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    v-model="formData.name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Organization Registration"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Key *</label>
                  <input
                    v-model="formData.key"
                    type="text"
                    required
                    :disabled="!!editingDocType"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="e.g., org_registration"
                  >
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Layer *</label>
                  <select
                    v-model="formData.layer"
                    required
                    :disabled="!!editingDocType"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Select Layer</option>
                    <option value="platform">Platform</option>
                    <option value="organization">Organization</option>
                    <option value="user">User</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Max Size (MB)</label>
                  <input
                    v-model.number="formData.maxSizeMB"
                    type="number"
                    min="1"
                    max="100"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="10"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <input
                    v-model.number="formData.order"
                    type="number"
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  >
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  v-model="formData.description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe what this document is for..."
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Allowed File Types</label>
                <input
                  v-model="formData.allowedMimeTypesText"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="application/pdf, image/jpeg, image/png"
                >
                <p class="text-xs text-gray-500 mt-1">Comma-separated MIME types. Leave empty to allow all types.</p>
              </div>

              <div class="flex items-center space-x-6">
                <label class="flex items-center">
                  <input
                    v-model="formData.required"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  >
                  <span class="ml-2 text-sm text-gray-700">Required Document</span>
                </label>

                <label class="flex items-center">
                  <input
                    v-model="formData.active"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  >
                  <span class="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>

              <div class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="!formData.name || !formData.key || !formData.layer"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {{ editingDocType ? 'Update' : 'Create' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Seed Modal -->
      <div
        v-if="showSeedModal"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        @click="showSeedModal = false"
      >
        <div class="relative top-20 mx-auto p-5 border max-w-md shadow-lg rounded-md bg-white" @click.stop>
          <div class="mt-3 text-center">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Seed Default Document Types</h3>
            <p class="text-sm text-gray-600 mb-6">
              This will create default document types for all layers. Existing types will not be duplicated.
            </p>
            <div class="flex justify-center space-x-3">
              <button
                @click="showSeedModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="seedDefaultTypes"
                class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
              >
                Seed Defaults
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
  roles: ['super_admin', 'platform_admin']
});

// Types
interface DocumentType {
  _id: string;
  name: string;
  key: string;
  layer: string;
  required: boolean;
  description?: string;
  active: boolean;
  order: number;
  maxSize: number;
  allowedMimeTypes: string[];
}

// Auth
const requestHeaders = process.server ? useRequestHeaders(['cookie']) : undefined;
const authResponse = await $fetch<{ user: { _id: string; role: string; organizationId?: string } | null }>(
  '/api/auth/user',
  { credentials: 'include', headers: requestHeaders }
);
const rawUser = authResponse?.user ?? null;
const user = rawUser
  ? { id: rawUser._id as string, role: rawUser.role as string, organizationId: rawUser.organizationId as string | undefined }
  : null;

// Reactive state
const selectedLayer = ref('all');
const documentTypes = ref<DocumentType[]>([]);
const showCreateModal = ref(false);
const showSeedModal = ref(false);
const editingDocType = ref<DocumentType | null>(null);

// Form data
const defaultFormData = {
  name: '',
  key: '',
  layer: '',
  required: false,
  description: '',
  maxSizeMB: 10,
  allowedMimeTypesText: '',
  active: true,
  order: 0
};

const formData = ref({ ...defaultFormData });

// Lifecycle
onMounted(() => {
  loadDocumentTypes();
});

// Methods
const loadDocumentTypes = async () => {
  try {
    const params = selectedLayer.value !== 'all' ? `?layer=${selectedLayer.value}` : '';
    const response = await $fetch<{ documentTypes: DocumentType[] }>(`/api/admin/document-types/list${params}`, {
      credentials: 'include'
    });
    documentTypes.value = response.documentTypes || [];
  } catch (error) {
    console.error('Failed to load document types:', error);
    alert('Failed to load document types');
  }
};

const editDocumentType = (docType: DocumentType) => {
  editingDocType.value = docType;
  formData.value = {
    name: docType.name,
    key: docType.key,
    layer: docType.layer,
    required: docType.required,
    description: docType.description || '',
    maxSizeMB: Math.round(docType.maxSize / (1024 * 1024)),
    allowedMimeTypesText: docType.allowedMimeTypes.join(', '),
    active: docType.active,
    order: docType.order
  };
};

const saveDocumentType = async () => {
  try {
    const payload = {
      name: formData.value.name,
      key: formData.value.key,
      layer: formData.value.layer,
      required: formData.value.required,
      description: formData.value.description,
      maxSize: formData.value.maxSizeMB * 1024 * 1024,
      allowedMimeTypes: formData.value.allowedMimeTypesText
        .split(',')
        .map(type => type.trim())
        .filter(type => type.length > 0),
      active: formData.value.active,
      order: formData.value.order
    };

    if (editingDocType.value) {
      // Update existing
      await $fetch(`/api/admin/document-types/${editingDocType.value._id}`, {
        method: 'PUT',
        body: payload,
        credentials: 'include'
      });
      alert('Document type updated successfully');
    } else {
      // Create new
      await $fetch('/api/admin/document-types/create', {
        method: 'POST',
        body: payload,
        credentials: 'include'
      });
      alert('Document type created successfully');
    }

    closeModal();
    loadDocumentTypes();
  } catch (error: any) {
    console.error('Failed to save document type:', error);
    alert(error.data?.message || 'Failed to save document type');
  }
};

const deleteDocumentType = async (docType: DocumentType) => {
  if (!confirm(`Are you sure you want to delete "${docType.name}"? This action cannot be undone.`)) {
    return;
  }

  try {
    await $fetch(`/api/admin/document-types/${docType._id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    alert('Document type deleted successfully');
    loadDocumentTypes();
  } catch (error: any) {
    console.error('Failed to delete document type:', error);
    alert(error.data?.message || 'Failed to delete document type');
  }
};

const seedDefaultTypes = async () => {
  try {
    await $fetch('/api/documents/seed', {
      method: 'POST',
      credentials: 'include'
    });
    alert('Default document types seeded successfully');
    showSeedModal.value = false;
    loadDocumentTypes();
  } catch (error: any) {
    console.error('Failed to seed document types:', error);
    alert(error.data?.message || 'Failed to seed document types');
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingDocType.value = null;
  formData.value = { ...defaultFormData };
};

const getLayerBadgeClass = (layer: string) => {
  const classes = {
    platform: 'bg-purple-100 text-purple-800',
    organization: 'bg-green-100 text-green-800',
    user: 'bg-blue-100 text-blue-800'
  };
  return classes[layer as keyof typeof classes] || 'bg-gray-100 text-gray-800';
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>