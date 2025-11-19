<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="md:flex md:items-center md:justify-between mb-6">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Platform Document Management
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            Upload required and optional documents set by Super Admin for your platform
          </p>
        </div>
      </div>

      <!-- My Platforms -->
      <div class="bg-white shadow rounded-lg mb-6">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">My Platforms</h3>
          <p class="mt-1 text-sm text-gray-500">
            Platforms you are an administrator for
          </p>
        </div>
        
        <div class="divide-y divide-gray-200">
          <div v-if="myPlatforms.length === 0" class="p-6 text-center text-gray-500">
            <h3 class="mt-2 text-sm font-medium text-gray-900">No platforms assigned</h3>
            <p class="mt-1 text-sm text-gray-500">Contact your super admin to get platform access.</p>
          </div>
          
          <div v-for="platform in myPlatforms" :key="platform._id" class="p-6 hover:bg-gray-50 cursor-pointer" @click="viewPlatform(platform)">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center">
                  <h4 class="text-lg font-medium text-gray-900">{{ platform.name }}</h4>
                  <span class="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="platform.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    {{ platform.active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <p class="mt-1 text-sm text-gray-600">{{ platform.description }}</p>
                <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  <span>Organizations: {{ platform.organizationCount || 0 }}</span>
                  <span>Required Docs: {{ platform.requiredDocsCount || 0 }}</span>
                  <span>Optional Docs: {{ platform.optionalDocsCount || 0 }}</span>
                </div>
              </div>
              
              <div class="flex items-center space-x-3">
                <button @click.stop="viewPlatformDocuments(platform)" class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Manage Documents
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Platform Document Management Detail -->
      <div v-if="selectedPlatform" class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ selectedPlatform.name }} - Document Management</h3>
              <p class="mt-1 text-sm text-gray-500">
                Upload and manage documents as required by Super Admin for this platform
              </p>
            </div>
            <button @click="selectedPlatform = null" class="text-gray-400 hover:text-gray-600">Close</button>
          </div>
        </div>

        <!-- Upload Progress Summary -->
        <div v-if="platformDocuments.length > 0" class="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{{ completedRequiredDocs }}/{{ platformRequiredDocs.length }}</div>
              <div class="text-sm text-gray-500">Required Documents</div>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div class="bg-red-600 h-2 rounded-full transition-all duration-300" 
                  :style="{ width: requiredDocsProgress + '%' }"></div>
              </div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{{ completedOptionalDocs }}/{{ platformOptionalDocs.length }}</div>
              <div class="text-sm text-gray-500">Optional Documents</div>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  :style="{ width: optionalDocsProgress + '%' }"></div>
              </div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{{ totalCompletedDocs }}/{{ platformDocuments.length }}</div>
              <div class="text-sm text-gray-500">Total Documents</div>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div class="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  :style="{ width: totalDocsProgress + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6">
          <div class="grid grid-cols-1 gap-8">
            <!-- Required Documents Section -->
            <div v-if="platformRequiredDocs.length > 0">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-lg font-medium text-red-600">Required Documents</h4>
                <span class="text-sm text-gray-500">{{ completedRequiredDocs }}/{{ platformRequiredDocs.length }} completed</span>
              </div>
              
              <div class="space-y-6">
                <div v-for="doc in platformRequiredDocs" :key="doc._id" class="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                      <div class="flex items-center">
                        <h5 class="text-sm font-medium text-gray-900">{{ doc.name }}</h5>
                        <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Required
                        </span>
                        <span v-if="getUploadedDocument(doc._id)" class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          ✓ Uploaded
                        </span>
                      </div>
                      <p class="text-xs text-gray-600 mt-1">{{ doc.description }}</p>
                      <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span v-if="doc.maxSize">Max: {{ formatFileSize(doc.maxSize) }}</span>
                        <span v-if="doc.allowedMimeTypes">Types: {{ doc.allowedMimeTypes.join(', ') }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Show uploaded document or upload component -->
                  <div v-if="getUploadedDocument(doc._id)" class="bg-white border border-gray-200 rounded-lg p-3">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <svg class="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
                        </svg>
                        <div>
                          <div class="text-sm font-medium text-gray-900">{{ getUploadedDocument(doc._id).originalName }}</div>
                          <div class="text-xs text-gray-500">Uploaded {{ formatDate(getUploadedDocument(doc._id).uploadedAt) }}</div>
                        </div>
                      </div>
                      <div class="flex items-center space-x-2">
                        <button @click="downloadDocument(getUploadedDocument(doc._id))" class="text-blue-600 hover:text-blue-800 text-sm">
                          Download
                        </button>
                        <button @click="replaceDocument(doc._id)" class="text-yellow-600 hover:text-yellow-800 text-sm">
                          Replace
                        </button>
                        <button @click="removeDocument(doc._id)" class="text-red-600 hover:text-red-800 text-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  <div v-else>
                    <DocumentUploader
                      :document-type-id="doc._id"
                      :required="true"
                      layer="platform"
                      :entity-id="selectedPlatform._id"
                      @upload-success="onDocumentUpload"
                      @upload-error="onDocumentError"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Optional Documents Section -->
            <div v-if="platformOptionalDocs.length > 0">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-lg font-medium text-blue-600">Optional Documents</h4>
                <span class="text-sm text-gray-500">{{ completedOptionalDocs }}/{{ platformOptionalDocs.length }} completed</span>
              </div>
              
              <div class="space-y-6">
                <div v-for="doc in platformOptionalDocs" :key="doc._id" class="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                      <div class="flex items-center">
                        <h5 class="text-sm font-medium text-gray-900">{{ doc.name }}</h5>
                        <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Optional
                        </span>
                        <span v-if="getUploadedDocument(doc._id)" class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          ✓ Uploaded
                        </span>
                      </div>
                      <p class="text-xs text-gray-600 mt-1">{{ doc.description }}</p>
                      <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span v-if="doc.maxSize">Max: {{ formatFileSize(doc.maxSize) }}</span>
                        <span v-if="doc.allowedMimeTypes">Types: {{ doc.allowedMimeTypes.join(', ') }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Show uploaded document or upload component -->
                  <div v-if="getUploadedDocument(doc._id)" class="bg-white border border-gray-200 rounded-lg p-3">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <svg class="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
                        </svg>
                        <div>
                          <div class="text-sm font-medium text-gray-900">{{ getUploadedDocument(doc._id).originalName }}</div>
                          <div class="text-xs text-gray-500">Uploaded {{ formatDate(getUploadedDocument(doc._id).uploadedAt) }}</div>
                        </div>
                      </div>
                      <div class="flex items-center space-x-2">
                        <button @click="downloadDocument(getUploadedDocument(doc._id))" class="text-blue-600 hover:text-blue-800 text-sm">
                          Download
                        </button>
                        <button @click="replaceDocument(doc._id)" class="text-yellow-600 hover:text-yellow-800 text-sm">
                          Replace
                        </button>
                        <button @click="removeDocument(doc._id)" class="text-red-600 hover:text-red-800 text-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  <div v-else>
                    <DocumentUploader
                      :document-type-id="doc._id"
                      :required="false"
                      layer="platform"
                      :entity-id="selectedPlatform._id"
                      @upload-success="onDocumentUpload"
                      @upload-error="onDocumentError"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- No Documents Message -->
            <div v-if="platformDocuments.length === 0" class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No document requirements</h3>
              <p class="text-gray-500">No document requirements have been set for this platform by the Super Admin.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="successMessage" class="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
      <div class="flex items-center">
        <svg class="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <span class="text-green-800">{{ successMessage }}</span>
      </div>
    </div>

    <div v-if="errorMessage" class="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
      <div class="flex items-center">
        <svg class="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <span class="text-red-800">{{ errorMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['auth-guard']
})

const myPlatforms = ref([])
const selectedPlatform = ref(null)
const platformDocuments = ref([])
const uploadedDocuments = ref([])
const successMessage = ref('')
const errorMessage = ref('')

const platformRequiredDocs = computed(() => 
  platformDocuments.value.filter(doc => doc.required)
)

const platformOptionalDocs = computed(() => 
  platformDocuments.value.filter(doc => !doc.required)
)

const completedRequiredDocs = computed(() => 
  platformRequiredDocs.value.filter(doc => getUploadedDocument(doc._id)).length
)

const completedOptionalDocs = computed(() => 
  platformOptionalDocs.value.filter(doc => getUploadedDocument(doc._id)).length
)

const totalCompletedDocs = computed(() => 
  uploadedDocuments.value.length
)

const requiredDocsProgress = computed(() => 
  platformRequiredDocs.value.length ? Math.round((completedRequiredDocs.value / platformRequiredDocs.value.length) * 100) : 100
)

const optionalDocsProgress = computed(() => 
  platformOptionalDocs.value.length ? Math.round((completedOptionalDocs.value / platformOptionalDocs.value.length) * 100) : 100
)

const totalDocsProgress = computed(() => 
  platformDocuments.value.length ? Math.round((totalCompletedDocs.value / platformDocuments.value.length) * 100) : 100
)

const loadMyPlatforms = async () => {
  try {
    console.log('Loading my platforms...')
    const result = await $fetch('/api/platform-admin/platforms')
    myPlatforms.value = result.data || []
    console.log('Loaded platforms:', myPlatforms.value.length)
  } catch (error) {
    console.error('Error loading platforms:', error)
  }
}

const viewPlatform = (platform) => {
  console.log('Viewing platform:', platform.name)
  viewPlatformDocuments(platform)
}

const viewPlatformDocuments = async (platform) => {
  selectedPlatform.value = platform
    
  try {
    console.log('Loading documents for platform:', platform.name)
    const result = await $fetch(`/api/platform-admin/platforms/${platform._id}/document-types`)
    platformDocuments.value = result.data || []
    console.log('Loaded documents:', platformDocuments.value.length)
    
    // Load uploaded documents for this platform
    await loadUploadedDocuments(platform._id)
  } catch (error) {
    console.error('Error loading platform documents:', error)
    platformDocuments.value = []
  }
}

const loadUploadedDocuments = async (platformId) => {
  try {
    const result = await $fetch(`/api/platform-admin/platforms/${platformId}/uploaded-documents`, {
      credentials: 'include'
    })
    uploadedDocuments.value = result.documents || []
    console.log('Loaded uploaded documents:', uploadedDocuments.value.length)
  } catch (error) {
    console.error('Error loading uploaded documents:', error)
    // This API might not exist yet, so we'll use mock data or empty array
    uploadedDocuments.value = []
  }
}

const getUploadedDocument = (documentTypeId) => {
  return uploadedDocuments.value.find(doc => doc.documentTypeId === documentTypeId)
}

const onDocumentUpload = async (uploadData) => {
  try {
    // Add the uploaded document to our local array
    uploadedDocuments.value.push({
      documentTypeId: uploadData.documentTypeId,
      originalName: uploadData.fileName,
      filePath: uploadData.filePath,
      fileSize: uploadData.fileSize,
      uploadedAt: new Date().toISOString(),
      ...uploadData
    })
    
    showSuccessMessage('Document uploaded successfully!')
  } catch (error) {
    console.error('Error handling document upload:', error)
    showErrorMessage('Failed to process document upload')
  }
}

const onDocumentError = (error) => {
  console.error('Document upload error:', error)
  showErrorMessage(typeof error === 'string' ? error : 'Document upload failed')
}

const downloadDocument = (document) => {
  try {
    // Create download link
    const link = document.createElement('a')
    link.href = document.filePath || `/api/documents/download/${document._id}`
    link.download = document.originalName
    link.click()
    
    showSuccessMessage('Document download started')
  } catch (error) {
    console.error('Error downloading document:', error)
    showErrorMessage('Failed to download document')
  }
}

const replaceDocument = async (documentTypeId) => {
  try {
    // Remove the current document first
    await removeDocument(documentTypeId, false)
    showSuccessMessage('Ready to upload replacement document')
  } catch (error) {
    console.error('Error replacing document:', error)
    showErrorMessage('Failed to prepare document replacement')
  }
}

const removeDocument = async (documentTypeId, showMessage = true) => {
  try {
    const documentToRemove = getUploadedDocument(documentTypeId)
    if (!documentToRemove) return
    
    // Call API to delete the document
    await $fetch(`/api/platform-admin/platforms/${selectedPlatform.value._id}/documents/${documentToRemove._id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    
    // Remove from local array
    uploadedDocuments.value = uploadedDocuments.value.filter(doc => doc.documentTypeId !== documentTypeId)
    
    if (showMessage) {
      showSuccessMessage('Document removed successfully')
    }
  } catch (error) {
    console.error('Error removing document:', error)
    if (showMessage) {
      showErrorMessage('Failed to remove document')
    }
  }
}

const showSuccessMessage = (message) => {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 5000)
}

const showErrorMessage = (message) => {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Invalid date'
  }
}

onMounted(() => {
  loadMyPlatforms()
})
</script>