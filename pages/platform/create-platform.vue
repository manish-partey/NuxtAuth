<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

definePageMeta({
  middleware: ['auth-guard'],
  roles: ['platform_admin']
});

const router = useRouter();
const currentStep = ref(1);
const loading = ref(false);
const error = ref('');
const success = ref('');

// Platform basic info
const platformInfo = ref({
  name: '',
  type: '',
  description: '',
  slug: ''
});

// Document types and requirements
const availableDocumentTypes = ref<DocumentType[]>([]);
const selectedDocumentTypes = ref<string[]>([]);
const documentRequirements = ref<Map<string, DocumentRequirement>>(new Map());

const platformTypes = [
  'grocery', 'college', 'doctor', 'hospital', 'logistics', 
  'freight', 'shipping', 'hotel', 'restaurant', 'retail', 'other'
];

// Step management
const totalSteps = 3;

const canProceedToDocuments = computed(() => {
  return platformInfo.value.name.trim() && 
         platformInfo.value.type && 
         platformInfo.value.description.trim();
});

const canProceedToReview = computed(() => {
  return selectedDocumentTypes.value.length > 0;
});

const requiredDocuments = computed(() => {
  return selectedDocumentTypes.value.filter(docId => {
    const requirement = documentRequirements.value.get(docId);
    return requirement && requirement.required;
  });
});

const optionalDocuments = computed(() => {
  return selectedDocumentTypes.value.filter(docId => {
    const requirement = documentRequirements.value.get(docId);
    return requirement && !requirement.required;
  });
});

// Load available document types
onMounted(async () => {
  try {
    const response = await $fetch('/api/admin/document-types', {
      credentials: 'include'
    });
    availableDocumentTypes.value = response.documentTypes || [];
  } catch (err) {
    console.error('Failed to load document types:', err);
  }
});

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

// Step navigation
const nextStep = () => {
  error.value = '';
  
  if (currentStep.value === 1 && !canProceedToDocuments.value) {
    error.value = 'Please fill in all required platform information.';
    return;
  }
  
  if (currentStep.value === 2 && !canProceedToReview.value) {
    error.value = 'Please select at least one document type with requirements.';
    return;
  }
  
  if (currentStep.value < totalSteps) {
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

// Document type management
interface DocumentType {
                                        _id: string;
                                        name: string;
                                        description?: string;
                                        maxSize?: number;
                                        allowedMimeTypes?: string[];
}

interface DocumentRequirement {
                                        documentTypeId: string;
                                        required: boolean;
                                        maxSize: number;
                                        allowedMimeTypes: string[];
                                        description: string;
}

const toggleDocumentType = (docType: DocumentType): void => {
                                        const index = selectedDocumentTypes.value.indexOf(docType._id);
                                        
                                        if (index === -1) {
                                                                                // Add document type
                                                                                selectedDocumentTypes.value.push(docType._id);
                                                                                documentRequirements.value.set(docType._id, {
                                                                                                                        documentTypeId: docType._id,
                                                                                                                        required: false,
                                                                                                                        maxSize: docType.maxSize || 5242880, // 5MB default
                                                                                                                        allowedMimeTypes: docType.allowedMimeTypes || ['application/pdf'],
                                                                                                                        description: docType.description || ''
                                                                                } as DocumentRequirement);
                                        } else {
                                                                                // Remove document type
                                                                                selectedDocumentTypes.value.splice(index, 1);
                                                                                documentRequirements.value.delete(docType._id);
                                        }
};

const setDocumentRequirement = (docId: string, required: boolean): void => {
  const requirement = documentRequirements.value.get(docId);
  if (requirement) {
    requirement.required = required;
    documentRequirements.value.set(docId, requirement);
  }
};

const getDocumentTypeName = (docId: string): string => {
  const docType = availableDocumentTypes.value.find(dt => dt._id === docId);
  return docType ? docType.name : 'Unknown Document';
};

const getDocumentTypeDetails = (docId: string): DocumentType | undefined => {
  return availableDocumentTypes.value.find(dt => dt._id === docId);
};

// Platform creation
const createPlatform = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    generateSlug();
    
    // Prepare platform data
    const platformData = {
      ...platformInfo.value,
      documentRequirements: Array.from(documentRequirements.value.values())
    };

    const response = await $fetch('/api/platform-admin/platforms', {
      method: 'POST',
      credentials: 'include',
      body: platformData
    });

    if (response.success) {
      success.value = 'Platform created successfully!';
      setTimeout(() => {
        router.push('/platform');
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
        <p class="text-gray-600 mt-2">Set up a new platform with document requirements</p>
      </div>

      <!-- Progress Indicator -->
      <div class="mb-8">
        <div class="flex items-center justify-center space-x-4">
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              :class="currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'">
              1
            </div>
            <span class="ml-2 text-sm font-medium">Platform Info</span>
          </div>
          <div class="w-16 h-px bg-gray-300"></div>
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              :class="currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'">
              2
            </div>
            <span class="ml-2 text-sm font-medium">Document Requirements</span>
          </div>
          <div class="w-16 h-px bg-gray-300"></div>
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              :class="currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'">
              3
            </div>
            <span class="ml-2 text-sm font-medium">Review & Create</span>
          </div>
        </div>
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

      <!-- Step Content -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <!-- Step 1: Platform Information -->
        <div v-if="currentStep === 1">
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
              <label class="block text-sm font-medium text-gray-700 mb-2">Platform Type *</label>
              <select
                v-model="platformInfo.type"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select platform type</option>
                <option v-for="type in platformTypes" :key="type" :value="type">
                  {{ type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ') }}
                </option>
              </select>
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
        </div>

        <!-- Step 2: Document Requirements -->
        <div v-if="currentStep === 2">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Document Requirements</h2>
          <p class="text-gray-600 mb-6">Select document types and specify whether they are required or optional for organizations on this platform.</p>
          
          <div class="space-y-4">
            <div v-for="docType in availableDocumentTypes" :key="docType._id" 
              class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              
              <div class="flex items-start space-x-4">
                <!-- Checkbox to select document type -->
                <div class="flex items-center mt-1">
                  <input
                    :id="'doc-' + docType._id"
                    type="checkbox"
                    :checked="selectedDocumentTypes.includes(docType._id)"
                    @change="toggleDocumentType(docType)"
                    class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                <div class="flex-1">
                  <label :for="'doc-' + docType._id" class="block font-medium text-gray-900 cursor-pointer">
                    {{ docType.name }}
                  </label>
                  <p class="text-sm text-gray-600 mt-1">{{ docType.description }}</p>
                  
                  <!-- Requirement settings (shown when document is selected) -->
                  <div v-if="selectedDocumentTypes.includes(docType._id)" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 class="text-sm font-medium text-gray-900 mb-3">Requirement Settings</h4>
                    
                    <div class="flex items-center space-x-6">
                      <label class="flex items-center">
                        <input
                          type="radio"
                          :name="'req-' + docType._id"
                          :value="true"
                          @change="setDocumentRequirement(docType._id, true)"
                          class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span class="ml-2 text-sm font-medium text-red-600">Required</span>
                      </label>
                      
                      <label class="flex items-center">
                        <input
                          type="radio"
                          :name="'req-' + docType._id"
                          :value="false"
                          @change="setDocumentRequirement(docType._id, false)"
                          class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          checked
                        />
                        <span class="ml-2 text-sm font-medium text-blue-600">Optional</span>
                      </label>
                    </div>

                    <div class="mt-3 text-xs text-gray-500">
                      <div>Max Size: {{ Math.round((docType.maxSize || 5242880) / 1024 / 1024) }}MB</div>
                      <div>Allowed Types: {{ (docType.allowedMimeTypes || ['application/pdf']).join(', ') }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="availableDocumentTypes.length === 0" class="text-center py-8">
              <p class="text-gray-500">No document types available. Contact your administrator to add document types first.</p>
            </div>
          </div>

          <!-- Selected Documents Summary -->
          <div v-if="selectedDocumentTypes.length > 0" class="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Selected Document Requirements</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-if="requiredDocuments.length > 0">
                <h4 class="text-sm font-medium text-red-600 mb-2">Required Documents ({{ requiredDocuments.length }})</h4>
                <ul class="space-y-1">
                  <li v-for="docId in requiredDocuments" :key="docId" class="text-sm text-gray-700">
                    • {{ getDocumentTypeName(docId) }}
                  </li>
                </ul>
              </div>

              <div v-if="optionalDocuments.length > 0">
                <h4 class="text-sm font-medium text-blue-600 mb-2">Optional Documents ({{ optionalDocuments.length }})</h4>
                <ul class="space-y-1">
                  <li v-for="docId in optionalDocuments" :key="docId" class="text-sm text-gray-700">
                    • {{ getDocumentTypeName(docId) }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Review -->
        <div v-if="currentStep === 3">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Review Platform Configuration</h2>
          
          <div class="space-y-6">
            <!-- Platform Information Review -->
            <div class="p-6 bg-gray-50 rounded-lg">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Platform Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span class="text-sm font-medium text-gray-500">Name:</span>
                  <span class="ml-2 text-sm text-gray-900">{{ platformInfo.name }}</span>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-500">Type:</span>
                  <span class="ml-2 text-sm text-gray-900">{{ platformInfo.type }}</span>
                </div>
                <div class="md:col-span-2">
                  <span class="text-sm font-medium text-gray-500">Slug:</span>
                  <span class="ml-2 text-sm text-gray-900">{{ platformInfo.slug }}</span>
                </div>
                <div class="md:col-span-2">
                  <span class="text-sm font-medium text-gray-500">Description:</span>
                  <p class="mt-1 text-sm text-gray-900">{{ platformInfo.description }}</p>
                </div>
              </div>
            </div>

            <!-- Document Requirements Review -->
            <div class="p-6 bg-gray-50 rounded-lg">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Document Requirements</h3>
              
              <div v-if="selectedDocumentTypes.length === 0" class="text-center py-4 text-gray-500">
                No document requirements configured
              </div>

              <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div v-if="requiredDocuments.length > 0">
                  <h4 class="text-sm font-medium text-red-600 mb-3">Required Documents</h4>
                  <div class="space-y-3">
                    <div v-for="docId in requiredDocuments" :key="docId" 
                      class="p-3 bg-red-50 border border-red-200 rounded">
                      <div class="font-medium text-sm text-gray-900">{{ getDocumentTypeName(docId) }}</div>
                      <div class="text-xs text-gray-600 mt-1">{{ getDocumentTypeDetails(docId)?.description }}</div>
                    </div>
                  </div>
                </div>

                <div v-if="optionalDocuments.length > 0">
                  <h4 class="text-sm font-medium text-blue-600 mb-3">Optional Documents</h4>
                  <div class="space-y-3">
                    <div v-for="docId in optionalDocuments" :key="docId" 
                      class="p-3 bg-blue-50 border border-blue-200 rounded">
                      <div class="font-medium text-sm text-gray-900">{{ getDocumentTypeName(docId) }}</div>
                      <div class="text-xs text-gray-600 mt-1">{{ getDocumentTypeDetails(docId)?.description }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            v-if="currentStep > 1"
            @click="previousStep"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Previous
          </button>
          <div v-else></div>

          <div class="flex space-x-3">
            <button
              @click="router.push('/platform')"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>

            <button
              v-if="currentStep < totalSteps"
              @click="nextStep"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Next
            </button>

            <button
              v-if="currentStep === totalSteps"
              @click="createPlatform"
              :disabled="loading"
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