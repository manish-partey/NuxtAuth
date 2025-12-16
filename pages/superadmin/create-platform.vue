<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const name = ref('');
const category = ref('');
const description = ref('');
const code = ref('');
const status = ref('active');
const contactEmail = ref('');
const contactPhone = ref('');
const error = ref('');
const loading = ref(false);
const currentStep = ref(1);

// Document management
interface DocumentType {
  _id: string;
  name: string;
  description: string;
  required: boolean;
}

interface UploadedDocument {
  documentTypeId: string;
  [key: string]: any;
}

const platformDocumentTypes = ref<DocumentType[]>([]);
const uploadedDocuments = ref<UploadedDocument[]>([]);

const platformCategories = [
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'education', label: 'Education' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'other', label: 'Other' }
];

// Computed properties
const requiredPlatformDocs = computed(() => {
  return platformDocumentTypes.value.filter(doc => doc.required);
});

const optionalPlatformDocs = computed(() => {
  return platformDocumentTypes.value.filter(doc => !doc.required);
});

const uploadedRequiredDocs = computed(() => {
  return uploadedDocuments.value.filter(doc => {
    const docType = platformDocumentTypes.value.find(dt => dt._id === doc.documentTypeId);
    return docType?.required;
  }).length;
});

const requiredDocsProgress = computed(() => {
  if (requiredPlatformDocs.value.length === 0) return 100;
  return Math.round((uploadedRequiredDocs.value / requiredPlatformDocs.value.length) * 100);
});

const canProceedToReview = computed(() => {
  return uploadedRequiredDocs.value === requiredPlatformDocs.value.length;
});

// Load document types on component mount
onMounted(async () => {
  try {
    const response = await $fetch('/api/document-types/public', {
      query: { layer: 'platform' }
    });
    if (response.success) {
      // Transform the API response to match the DocumentType structure
      platformDocumentTypes.value = (response.documentTypes || []).map((doc: any) => ({
        _id: doc._id,
        name: String(doc.name || ''), // Ensure name is a string
        description: String(doc.description || ''), // Ensure description is a string
        required: Boolean(doc.required), // Ensure required is a boolean
      }));
    }
  } catch (error) {
    console.error('Failed to load document types:', error);
  }
});

// Helper to generate slug from the platform name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const proceedToDocuments = () => {
  error.value = '';
  if (!name.value.trim() || !category.value || !code.value.trim()) {
    error.value = 'Please enter all required fields (Name, Category, and Code).';
    return;
  }
  currentStep.value = 2;
};

const proceedToReview = () => {
  if (canProceedToReview.value) {
    currentStep.value = 3;
  }
};

interface DocumentUploadData {
  documentTypeId: string;
  [key: string]: any;
}

const handleDocumentUpload = (document: DocumentUploadData): void => {
  const existingIndex = uploadedDocuments.value.findIndex(
    (doc: UploadedDocument) => doc.documentTypeId === document.documentTypeId
  );
  
  if (existingIndex !== -1) {
    uploadedDocuments.value[existingIndex] = document;
  } else {
    uploadedDocuments.value.push(document);
  }
};

interface DocumentErrorEvent {
  message: string;
}

const handleDocumentError = (errorMessage: string): void => {
  error.value = `Document upload failed: ${errorMessage}`;
};

const getDocumentTypeName = (documentTypeId: string): string => {
  const docType = platformDocumentTypes.value.find((dt: DocumentType) => dt._id === documentTypeId);
  return docType?.name || 'Unknown Document';
};

async function createPlatform() {
  error.value = '';
  loading.value = true;
  
  try {
    const slug = generateSlug(name.value.trim());
    const platformData = {
      name: name.value.trim(),
      category: category.value,
      description: description.value.trim(),
      code: code.value.trim(),
      status: status.value,
      contactEmail: contactEmail.value.trim(),
      contactPhone: contactPhone.value.trim(),
      slug,
      documents: uploadedDocuments.value
    };

    const response = await $fetch('/api/superadmin/platforms', {
      method: 'POST',
      credentials: 'include',
      body: platformData,
    });

    if (response.success) {
      router.push('/superadmin/platforms');
    } else {
      error.value = (response as any).message || 'Failed to create platform.';
    }
  } catch (e: any) {
    error.value = e.data?.message || e.statusMessage || 'Failed to create platform.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-lg">
      <h1 class="text-3xl font-semibold text-center text-blue-700 mb-6">Create New Platform</h1>
      
      <!-- Quick Actions -->
      <div class="mb-6 flex justify-center">
        <NuxtLink 
          to="/superadmin/platform-document-requirements"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
          Manage Platform Document Requirements
        </NuxtLink>
      </div>

      <!-- Progress Indicator -->
      <div class="mb-8">
        <div class="flex items-center justify-center space-x-4">
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              :class="currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'">
              1
            </div>
            <span class="ml-2 text-sm font-medium text-gray-900">Platform Details</span>
          </div>
          <div class="w-16 h-px bg-gray-300"></div>
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              :class="currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'">
              2
            </div>
            <span class="ml-2 text-sm font-medium text-gray-900">Required Documents</span>
          </div>
          <div class="w-16 h-px bg-gray-300"></div>
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              :class="currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'">
              3
            </div>
            <span class="ml-2 text-sm font-medium text-gray-900">Review & Submit</span>
          </div>
        </div>
      </div>

      <!-- Step 1: Platform Details -->
      <div v-if="currentStep === 1">
        <form @submit.prevent="proceedToDocuments" class="space-y-5">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Platform Name *</label>
            <input
              id="name"
              type="text"
              v-model="name"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g., Grocery Chain Platform"
              required
            />
          </div>

          <div>
            <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Platform Category *</label>
            <select id="category" v-model="category" 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              required>
              <option value="" disabled>Select platform category...</option>
              <option v-for="cat in platformCategories" :key="cat.value" :value="cat.value">
                {{ cat.label }}
              </option>
            </select>
            <p class="text-sm text-gray-500 mt-1">Determines which organization types will be available</p>
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="description"
              v-model="description"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Brief description of the platform..."
            ></textarea>
          </div>

          <div>
            <label for="code" class="block text-sm font-medium text-gray-700 mb-1">Platform Code *</label>
            <input
              id="code"
              type="text"
              v-model="code"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g., healthcare-001"
              required
            />
            <p class="text-sm text-gray-500 mt-1">Unique identifier for the platform</p>
          </div>

          <div>
            <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select id="status" v-model="status" 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              required>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="contactEmail" class="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input
                id="contactEmail"
                type="email"
                v-model="contactEmail"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="contact@healthcare.com"
              />
            </div>
            <div>
              <label for="contactPhone" class="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input
                id="contactPhone"
                type="tel"
                v-model="contactPhone"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="+1-555-0100"
              />
            </div>
          </div>

          <div class="flex space-x-4">
            <button type="button" @click="$router.push('/superadmin/platforms')"
              class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition">
              Cancel
            </button>
            <!-- <button
              @click="proceedToDocuments"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Continue to Documents
            </button> -->
            <button
              @click="createPlatform"
              :disabled="loading"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:bg-gray-400"
            >
              {{ loading ? 'Creating...' : 'Create Platform' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Step 2: Document Upload -->
      <div v-if="currentStep === 2">
        <div class="space-y-6">
          <div class="text-center">
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Platform Documents</h2>
            <p class="text-gray-600">Please upload the required documents for your platform</p>
          </div>

          <!-- Required Documents -->
          <div v-if="requiredPlatformDocs.length > 0" class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">Required Documents</h3>
            <div class="grid gap-4">
              <div v-for="docType in requiredPlatformDocs" :key="docType._id" 
                class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-medium text-gray-900">{{ docType.name }}</h4>
                  <span class="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>
                </div>
                <p class="text-sm text-gray-600 mb-3">{{ docType.description }}</p>
                <DocumentUploader
                  :document-type-id="docType._id"
                  :required="true"
                  layer="platform"
                  @upload-success="handleDocumentUpload"
                  @upload-error="handleDocumentError"
                />
              </div>
            </div>
          </div>

          <!-- Optional Documents -->
          <div v-if="optionalPlatformDocs.length > 0" class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">Optional Documents</h3>
            <div class="grid gap-4">
              <div v-for="docType in optionalPlatformDocs" :key="docType._id" 
                class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-medium text-gray-900">{{ docType.name }}</h4>
                  <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">Optional</span>
                </div>
                <p class="text-sm text-gray-600 mb-3">{{ docType.description }}</p>
                <DocumentUploader
                  :document-type-id="docType._id"
                  :required="false"
                  layer="platform"
                  @upload-success="handleDocumentUpload"
                  @upload-error="handleDocumentError"
                />
              </div>
            </div>
          </div>

          <div v-if="platformDocumentTypes.length === 0" class="text-center py-8">
            <div class="text-gray-500">
              <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No documents required for platform creation at this time.</p>
            </div>
          </div>

          <!-- Document Upload Progress -->
          <div v-if="requiredPlatformDocs.length > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-blue-900">Required Documents Progress</span>
              <span class="text-sm text-blue-700">{{ uploadedRequiredDocs }} / {{ requiredPlatformDocs.length }}</span>
            </div>
            <div class="mt-2 bg-blue-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                :style="{ width: requiredDocsProgress + '%' }"></div>
            </div>
          </div>

          <div class="flex space-x-4">
            <button type="button" @click="currentStep = 1"
              class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition">
              Back
            </button>
            <button type="button" @click="proceedToReview" :disabled="!canProceedToReview"
              class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition">
              Continue to Review
            </button>
          </div>
        </div>
      </div>

      <!-- Step 3: Review & Submit -->
      <div v-if="currentStep === 3">
        <div class="space-y-6">
          <div class="text-center">
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Review & Submit</h2>
            <p class="text-gray-600">Please review your information before creating the platform</p>
          </div>

          <!-- Platform Details Review -->
          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Platform Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium text-gray-700">Platform Name:</span>
                <span class="ml-2 text-gray-900">{{ name }}</span>
              </div>
              <div>
                <span class="font-medium text-gray-700">Type:</span>
                <span class="ml-2 text-gray-900">{{ type.charAt(0).toUpperCase() + type.slice(1) }}</span>
              </div>
              <div v-if="description" class="md:col-span-2">
                <span class="font-medium text-gray-700">Description:</span>
                <span class="ml-2 text-gray-900">{{ description }}</span>
              </div>
            </div>
          </div>

          <!-- Documents Review -->
          <div v-if="uploadedDocuments.length > 0" class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Uploaded Documents</h3>
            <div class="space-y-2">
              <div v-for="doc in uploadedDocuments" :key="doc.documentTypeId" 
                class="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                <span class="text-sm font-medium text-gray-700">{{ getDocumentTypeName(doc.documentTypeId) }}</span>
                <span class="text-sm text-green-600 flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  Uploaded
                </span>
              </div>
            </div>
          </div>

          <div class="flex space-x-4">
            <button type="button" @click="currentStep = 2"
              class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition">
              Back to Documents
            </button>
            <button type="button" @click="createPlatform" :disabled="loading"
              class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center">
              <span v-if="loading" class="mr-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ loading ? 'Creating...' : 'Create Platform33' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Error Messages -->
      <div v-if="error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-red-800">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>