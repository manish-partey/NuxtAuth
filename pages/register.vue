<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-8">
      <h1 class="text-3xl font-semibold text-blue-700 text-center mb-6">Create an Account</h1>

      <!-- Progress Indicator -->
      <div class="mb-8">
        <div class="flex items-center justify-center space-x-4">
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              :class="currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'">
              1
            </div>
            <span class="ml-2 text-sm font-medium text-gray-900">Basic Information</span>
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

      <!-- Step 1: Basic Information -->
      <div v-if="currentStep === 1">
        <form @submit.prevent="proceedToDocuments" class="space-y-5">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">Username *</label>
            <input id="username" v-model="username" type="text" placeholder="yourusername"
              class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required />
          </div>

          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Full Name *</label>
            <input id="name" v-model="name" type="text" placeholder="Your Name"
              class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address *</label>
            <input id="email" v-model="email" type="email" placeholder="you@example.com"
              class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password *</label>
            <input id="password" v-model="password" type="password" placeholder="••••••••" minlength="8"
              class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required />
            <p class="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
          </div>

          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">Phone Number</label>
            <input id="phone" v-model="phone" type="tel" placeholder="+1 (555) 123-4567"
              class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div class="flex space-x-4">
            <button type="button" @click="$router.push('/login')"
              class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition">
              Back to Login
            </button>
            <button type="submit"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition">
              Continue to Documents
            </button>
          </div>
        </form>
      </div>

      <!-- Step 2: Document Upload -->
      <div v-if="currentStep === 2">
        <div class="space-y-6">
          <div class="text-center">
            <h2 class="text-xl font-semibold text-gray-900 mb-2">User Documents</h2>
            <p class="text-gray-600">Please upload the required documents for your account</p>
          </div>

          <!-- Required Documents -->
          <div v-if="requiredUserDocs.length > 0" class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">Required Documents</h3>
            <div class="grid gap-4">
              <div v-for="docType in requiredUserDocs" :key="docType._id" 
                class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-medium text-gray-900">{{ docType.name }}</h4>
                  <span class="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>
                </div>
                <p class="text-sm text-gray-600 mb-3">{{ docType.description }}</p>
                <DocumentUploader
                  :document-type-id="docType._id"
                  :required="true"
                  layer="user"
                  @upload-success="handleDocumentUpload"
                  @upload-error="handleDocumentError"
                />
              </div>
            </div>
          </div>

          <!-- Optional Documents -->
          <div v-if="optionalUserDocs.length > 0" class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">Optional Documents</h3>
            <div class="grid gap-4">
              <div v-for="docType in optionalUserDocs" :key="docType._id" 
                class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-medium text-gray-900">{{ docType.name }}</h4>
                  <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">Optional</span>
                </div>
                <p class="text-sm text-gray-600 mb-3">{{ docType.description }}</p>
                <DocumentUploader
                  :document-type-id="docType._id"
                  :required="false"
                  layer="user"
                  @upload-success="handleDocumentUpload"
                  @upload-error="handleDocumentError"
                />
              </div>
            </div>
          </div>

          <div v-if="userDocumentTypes.length === 0" class="text-center py-8">
            <div class="text-gray-500">
              <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No documents required for user registration at this time.</p>
            </div>
          </div>

          <!-- Document Upload Progress -->
          <div v-if="requiredUserDocs.length > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-blue-900">Required Documents Progress</span>
              <span class="text-sm text-blue-700">{{ uploadedRequiredDocs }} / {{ requiredUserDocs.length }}</span>
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
            <p class="text-gray-600">Please review your information before creating your account</p>
          </div>

          <!-- User Details Review -->
          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium text-gray-700">Username:</span>
                <span class="ml-2 text-gray-900">{{ username }}</span>
              </div>
              <div>
                <span class="font-medium text-gray-700">Full Name:</span>
                <span class="ml-2 text-gray-900">{{ name }}</span>
              </div>
              <div>
                <span class="font-medium text-gray-700">Email:</span>
                <span class="ml-2 text-gray-900">{{ email }}</span>
              </div>
              <div v-if="phone">
                <span class="font-medium text-gray-700">Phone:</span>
                <span class="ml-2 text-gray-900">{{ phone }}</span>
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
            <button type="button" @click="handleRegister" :disabled="isRegistering"
              class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center">
              <span v-if="isRegistering" class="mr-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ isRegistering ? 'Creating Account...' : 'Create Account' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div v-if="message" class="mt-6 p-4 rounded-lg" :class="messageClass">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg v-if="messageType === 'success'" class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium">{{ message }}</p>
          </div>
        </div>
      </div>

      <div class="text-center mt-6 text-sm text-gray-600">
        Already have an account?
        <NuxtLink to="/login" class="text-blue-600 hover:underline">Sign In</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// Type definitions
interface DocumentType {
  _id: string;
  name: string;
  description: string;
  required: boolean;
}

interface UploadedDocument {
  documentTypeId: string;
  // Add other properties as needed
}

// Form data
const username = ref('');
const name = ref('');
const email = ref('');
const password = ref('');
const phone = ref('');

// UI state
const message = ref('');
const messageType = ref('');
const currentStep = ref(1);
const isRegistering = ref(false);

// Document management
const userDocumentTypes = ref<DocumentType[]>([]);
const uploadedDocuments = ref<UploadedDocument[]>([]);

// Computed properties
const messageClass = computed(() => {
  return messageType.value === 'success' 
    ? 'bg-green-50 border border-green-200 text-green-800'
    : 'bg-red-50 border border-red-200 text-red-800';
});

const requiredUserDocs = computed(() => {
  return userDocumentTypes.value.filter(doc => doc.required);
});

const optionalUserDocs = computed(() => {
  return userDocumentTypes.value.filter(doc => !doc.required);
});

const uploadedRequiredDocs = computed(() => {
  return uploadedDocuments.value.filter(doc => {
    const docType = userDocumentTypes.value.find(dt => dt._id === doc.documentTypeId);
    return docType?.required;
  }).length;
});

const requiredDocsProgress = computed(() => {
  if (requiredUserDocs.value.length === 0) return 100;
  return Math.round((uploadedRequiredDocs.value / requiredUserDocs.value.length) * 100);
});

const canProceedToReview = computed(() => {
  return uploadedRequiredDocs.value === requiredUserDocs.value.length;
});

// Load document types on component mount
onMounted(async () => {
  try {
    const response = await $fetch('/api/document-types/public', {
      query: { layer: 'user' }
    });
    if (response.success) {
      userDocumentTypes.value = response.documentTypes || [];
    }
  } catch (error) {
    console.error('Failed to load document types:', error);
  }
});

const proceedToDocuments = () => {
  if (!username.value.trim() || !name.value.trim() || !email.value.trim()) {
    message.value = 'Please fill in all required fields.';
    messageType.value = 'error';
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value.trim())) {
    message.value = 'Please enter a valid email address.';
    messageType.value = 'error';
    return;
  }

  // Validate password length
  if (password.value.length < 8) {
    message.value = 'Password must be at least 8 characters long.';
    messageType.value = 'error';
    return;
  }

  message.value = '';
  currentStep.value = 2;
};

const proceedToReview = () => {
  if (canProceedToReview.value) {
    currentStep.value = 3;
  }
};

interface UploadedDocumentData {
  documentTypeId: string;
  [key: string]: any; // Allow for additional properties
}

const handleDocumentUpload = (document: UploadedDocumentData): void => {
  const existingIndex: number = uploadedDocuments.value.findIndex(
    (doc: UploadedDocumentData) => doc.documentTypeId === document.documentTypeId
  );
  
  if (existingIndex !== -1) {
    uploadedDocuments.value[existingIndex] = document;
  } else {
    uploadedDocuments.value.push(document);
  }
};

interface DocumentError {
  message?: string;
  [key: string]: any;
}

const handleDocumentError = (error: DocumentError | string): void => {
  const errorMessage = typeof error === 'string' ? error : (error.message || 'Unknown error');
  message.value = `Document upload failed: ${errorMessage}`;
  messageType.value = 'error';
};

const getDocumentTypeName = (documentTypeId: string): string => {
  const docType = userDocumentTypes.value.find(dt => dt._id === documentTypeId);
  return docType?.name || 'Unknown Document';
};

const handleRegister = async () => {
  message.value = '';
  isRegistering.value = true;
  
  try {
    const registrationData = {
      username: username.value.trim(),
      name: name.value.trim(),
      email: email.value.trim().toLowerCase(),
      password: password.value,
      phone: phone.value.trim(),
      documents: uploadedDocuments.value
    };

    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: registrationData
    });

    message.value = response.message;
    messageType.value = 'success';

    // Clear form on success
    username.value = '';
    name.value = '';
    email.value = '';
    password.value = '';
    phone.value = '';
    uploadedDocuments.value = [];
    currentStep.value = 1;
    
  } catch (error: any) {
    message.value = error?.data?.message || error?.statusMessage || 'Registration failed.';
    messageType.value = 'error';
  } finally {
    isRegistering.value = false;
  }
};
</script>
