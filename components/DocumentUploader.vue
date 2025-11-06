
<template>
  <div class="document-uploader">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-lg font-semibold mb-4">Upload Document</h3>
      
      <!-- Document Type Selection -->
      <div class="mb-4" v-if="showDocumentTypes">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Document Type
        </label>
        <select 
          v-model="selectedDocType" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          @change="onDocTypeChange"
        >
          <option value="">Select document type...</option>
          <option 
            v-for="docType in availableDocTypes" 
            :key="docType.key" 
            :value="docType"
          >
            {{ docType.name }} {{ docType.required ? '(Required)' : '(Optional)' }}
          </option>
        </select>
        <p v-if="selectedDocType?.description" class="text-sm text-gray-600 mt-1">
          {{ selectedDocType.description }}
        </p>
      </div>

      <!-- File Upload Area -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Select File
        </label>
        <div 
          class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
          :class="{ 'border-blue-500 bg-blue-50': isDragOver }"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop"
          @click="fileInput?.click()"
        >
          <div v-if="!selectedFile">
            <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <p class="mt-2 text-sm text-gray-600">
              <span class="font-medium text-blue-600 hover:text-blue-500">Click to upload</span>
              or drag and drop
            </p>
            <p class="text-xs text-gray-500">
              {{ getAllowedTypesText() }}
              {{ maxSizeText }}
            </p>
          </div>
          <div v-else class="text-green-600">
            <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="mt-2 text-sm font-medium">{{ selectedFile.name }}</p>
            <p class="text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
            <button 
              @click.stop="selectedFile = null" 
              class="mt-2 text-xs text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        </div>
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          @change="handleFileSelect"
          :accept="getAcceptedTypes()"
        />
      </div>

      <!-- Validation Messages -->
      <div v-if="validationError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
        <p class="text-sm text-red-600">{{ validationError }}</p>
      </div>

      <!-- Upload Progress -->
      <div v-if="uploading" class="mb-4">
        <div class="flex items-center justify-between text-sm text-gray-600 mb-1">
          <span>Uploading...</span>
          <span>{{ uploadProgress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            :style="{ width: uploadProgress + '%' }"
          ></div>
        </div>
      </div>

      <!-- Upload Button -->
      <div class="flex justify-end space-x-3">
        <button
          v-if="selectedFile"
          @click="selectedFile = null"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          :disabled="uploading"
        >
          Cancel
        </button>
        <button
          @click="uploadFile"
          :disabled="!selectedFile || uploading"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {{ uploading ? 'Uploading...' : 'Upload Document' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DocumentType {
  key: string;
  name: string;
  description?: string;
  required: boolean;
  maxSize?: number;
  allowedMimeTypes?: string[];
}

interface Props {
  layer?: string;
  layerId?: string;
  showDocumentTypes?: boolean;
  availableDocTypes?: DocumentType[];
}

const props = withDefaults(defineProps<Props>(), {
  layer: 'organization',
  layerId: '',
  showDocumentTypes: true,
  availableDocTypes: () => []
});

const emit = defineEmits<{
  uploaded: [document: any];
  error: [error: string];
}>();

// Reactive state
const selectedFile = ref<File | null>(null);
const selectedDocType = ref<DocumentType | null>(null);
const uploading = ref(false);
const uploadProgress = ref(0);
const validationError = ref('');
const isDragOver = ref(false);

// Template refs
const fileInput = ref<HTMLInputElement>();

// Computed
const maxSizeText = computed(() => {
  const maxSize = selectedDocType.value?.maxSize || (10 * 1024 * 1024); // 10MB default
  return `Max size: ${formatFileSize(maxSize)}`;
});

// Methods
const onDocTypeChange = () => {
  validationError.value = '';
  if (selectedFile.value) {
    validateFile(selectedFile.value);
  }
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    selectedFile.value = file;
    validateFile(file);
  }
};

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    const file = event.dataTransfer.files[0];
    selectedFile.value = file;
    validateFile(file);
  }
};

const validateFile = (file: File) => {
  validationError.value = '';
  
  if (!selectedDocType.value && props.showDocumentTypes) {
    validationError.value = 'Please select a document type first';
    return false;
  }

  const maxSize = selectedDocType.value?.maxSize || (10 * 1024 * 1024);
  if (file.size > maxSize) {
    validationError.value = `File size ${formatFileSize(file.size)} exceeds maximum allowed size ${formatFileSize(maxSize)}`;
    return false;
  }

  const allowedTypes = selectedDocType.value?.allowedMimeTypes || [];
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    validationError.value = `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`;
    return false;
  }

  return true;
};

const uploadFile = async () => {
  if (!selectedFile.value) return;
  
  if (!validateFile(selectedFile.value)) return;

  uploading.value = true;
  uploadProgress.value = 0;
  validationError.value = '';

  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    formData.append('layer', props.layer);
    if (props.layerId) formData.append('layerId', props.layerId);
    if (selectedDocType.value) formData.append('docKey', selectedDocType.value.key);

    // Simulate upload progress for better UX
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += Math.random() * 20;
      }
    }, 200);

    const response = await $fetch<{ document: any }>('/api/documents/upload', {
      method: 'POST',
      body: formData
    });

    clearInterval(progressInterval);
    uploadProgress.value = 100;

    emit('uploaded', response.document);
    
    // Reset form
    selectedFile.value = null;
    selectedDocType.value = null;
    uploadProgress.value = 0;
    
  } catch (error: any) {
    console.error('Upload error:', error);
    const errorMessage = error.data?.message || error.message || 'Upload failed';
    validationError.value = errorMessage;
    emit('error', errorMessage);
  } finally {
    uploading.value = false;
  }
};

const getAcceptedTypes = (): string => {
  if (!selectedDocType.value?.allowedMimeTypes?.length) return '*';
  return selectedDocType.value.allowedMimeTypes.join(',');
};

const getAllowedTypesText = (): string => {
  if (!selectedDocType.value?.allowedMimeTypes?.length) return 'All file types allowed';
  
  const types = selectedDocType.value.allowedMimeTypes.map(type => {
    if (type.startsWith('image/')) return 'Images';
    if (type === 'application/pdf') return 'PDF';
    if (type.includes('word')) return 'Word';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'Excel';
    return type;
  });
  
  return `Allowed: ${[...new Set(types)].join(', ')}`;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<style scoped>
.document-uploader {
  max-width: 42rem;
}
</style>
