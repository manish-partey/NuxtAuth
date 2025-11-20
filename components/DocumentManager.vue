<template>
  <div class="bg-white shadow-sm rounded-lg">
    <!-- Header -->
    <div class="border-b border-gray-200 p-6">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-medium text-gray-900">Documents</h2>
        <div class="flex items-center space-x-4">
          <!-- Status Filter -->
          <select
            v-model="statusFilter"
            @change="loadDocuments"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Status</option>
            <option value="uploaded">Uploaded</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            @click="loadDocuments"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span class="ml-2">Refresh</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-8 text-center">
      <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="mt-2 text-gray-600">Loading documents...</p>
    </div>

    <!-- Document List -->
    <div v-else-if="documents.length > 0" class="divide-y divide-gray-200">
      <div 
        v-for="doc in documents" 
        :key="doc._id" 
        class="p-6 hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-medium text-gray-900">{{ doc.name }}</h3>
                <p class="text-sm text-gray-500">{{ doc.originalName }}</p>
                <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>Size: {{ formatFileSize(doc.size) }}</span>
                  <span>Uploaded: {{ formatDate(doc.uploadedAt) }}</span>
                  <span v-if="doc.required" class="text-red-600 font-medium">Required</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex items-center space-x-3">
            <!-- Status Badge -->
            <span :class="getStatusClass(doc.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
              {{ doc.status }}
            </span>

            <!-- Actions -->
            <div class="flex items-center space-x-2">
              <!-- Approve/Reject Actions -->
              <template v-if="canApprove(doc) && doc.status === 'pending'">
                <button
                  @click="approveDocument(doc)"
                  :disabled="processingDoc === doc._id"
                  class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Approve
                </button>
                <button
                  @click="openRejectModal(doc)"
                  :disabled="processingDoc === doc._id"
                  class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Reject
                </button>
              </template>

              <!-- Delete Action -->
              <button
                v-if="canDelete(doc)"
                @click="deleteDocument(doc)"
                :disabled="processingDoc === doc._id"
                class="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="p-8 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No documents</h3>
      <p class="mt-1 text-sm text-gray-500">No documents have been uploaded yet.</p>
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeRejectModal">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Reject Document</h3>
          <div class="mb-4">
            <label for="reject-reason" class="block text-sm font-medium text-gray-700 mb-2">
              Reason for rejection:
            </label>
            <textarea
              id="reject-reason"
              v-model="rejectReason"
              rows="4"
              class="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Please provide a reason for rejecting this document..."
            ></textarea>
          </div>
          <div class="flex items-center justify-end space-x-3">
            <button
              type="button"
              @click="closeRejectModal"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="rejectDocument"
              :disabled="!rejectReason.trim() || (documentToReject !== null && processingDoc === documentToReject._id)"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              Reject Document
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Simple type definitions to avoid complex inference
type DocumentStatus = 'uploaded' | 'pending' | 'approved' | 'rejected';

interface SimpleDocument {
  _id: string;
  name: string;
  originalName: string;
  type: string;
  mimeType: string;
  size: number;
  status: DocumentStatus;
  layer: string;
  layerId?: string;
  uploadedBy: string;
  uploadedAt: string;
  required: boolean;
}

interface ComponentProps {
  layer?: string;
  layerId?: string;
  userRole?: string;
  userId?: string;
  organizationId?: string;
}

// Props with defaults
const props = withDefaults(defineProps<ComponentProps>(), {
  layer: '',
  layerId: '',
  userRole: 'user',
  userId: '',
  organizationId: ''
});

// Events
const emit = defineEmits<{
  documentUpdated: [document: SimpleDocument];
  documentDeleted: [documentId: string];
}>();

// Simple reactive state
const documents = ref<SimpleDocument[]>([]);
const loading = ref<boolean>(false);
const statusFilter = ref<string>('');
const processingDoc = ref<string>('');
const showRejectModal = ref<boolean>(false);
const rejectReason = ref<string>('');
const documentToReject = ref<SimpleDocument | null>(null);

// Lifecycle
onMounted(() => {
  loadDocuments();
});

// API Methods with explicit typing
async function loadDocuments(): Promise<void> {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (props.layer) params.append('layer', props.layer);
    if (props.layerId) params.append('layerId', props.layerId);
    if (statusFilter.value) params.append('status', statusFilter.value);

    const url = `/api/documents/list?${params.toString()}`;
    // Use any type to avoid complex Nuxt router type inference
    const response: any = await $fetch(url);
    documents.value = response.documents || [];
  } catch (error) {
    console.error('Failed to load documents:', error);
    documents.value = [];
  } finally {
    loading.value = false;
  }
}

async function approveDocument(doc: SimpleDocument): Promise<void> {
  processingDoc.value = doc._id;
  try {
    const response: any = await $fetch('/api/documents/approve', {
      method: 'POST',
      body: { documentId: doc._id }
    });

    // Update document status
    const index = documents.value.findIndex(d => d._id === doc._id);
    if (index !== -1 && documents.value[index]) {
      documents.value[index].status = 'approved';
      emit('documentUpdated', documents.value[index]);
    }
  } catch (error: any) {
    console.error('Failed to approve document:', error);
    alert(error.data?.message || 'Failed to approve document');
  } finally {
    processingDoc.value = '';
  }
}

function openRejectModal(doc: SimpleDocument): void {
  documentToReject.value = doc;
  rejectReason.value = '';
  showRejectModal.value = true;
}

function closeRejectModal(): void {
  showRejectModal.value = false;
  documentToReject.value = null;
  rejectReason.value = '';
}

async function rejectDocument(): Promise<void> {
  if (!documentToReject.value || !rejectReason.value.trim()) return;

  processingDoc.value = documentToReject.value._id;
  try {
    const response: any = await $fetch('/api/documents/reject', {
      method: 'POST',
      body: { 
        documentId: documentToReject.value._id,
        reason: rejectReason.value.trim()
      }
    });

    // Update document status
    const index = documents.value.findIndex(d => d._id === documentToReject.value!._id);
    if (index !== -1 && documents.value[index]) {
      documents.value[index].status = 'rejected';
      emit('documentUpdated', documents.value[index]);
    }
    closeRejectModal();
  } catch (error: any) {
    console.error('Failed to reject document:', error);
    alert(error.data?.message || 'Failed to reject document');
  } finally {
    processingDoc.value = '';
  }
}

async function deleteDocument(doc: SimpleDocument): Promise<void> {
  if (!confirm(`Are you sure you want to delete "${doc.name}"?`)) return;

  processingDoc.value = doc._id;
  try {
    const response: any = await $fetch(`/api/documents/${doc._id}`, {
      method: 'DELETE'
    });

    // Remove from list
    const index = documents.value.findIndex(d => d._id === doc._id);
    if (index !== -1) {
      documents.value.splice(index, 1);
    }

    emit('documentDeleted', doc._id);
  } catch (error: any) {
    console.error('Failed to delete document:', error);
    alert(error.data?.message || 'Failed to delete document');
  } finally {
    processingDoc.value = '';
  }
}

// Permission functions with explicit return types
function canApprove(doc: SimpleDocument): boolean {
  if (props.userRole === 'platform_admin') return true;
  if (props.userRole === 'organization_admin' && doc.layer === 'organization' && doc.layerId === props.organizationId) return true;
  return false;
}

function canDelete(doc: SimpleDocument): boolean {
  if (props.userRole === 'platform_admin') return true;
  if (doc.uploadedBy === props.userId) return true;
  if (props.userRole === 'organization_admin' && doc.layer === 'organization' && doc.layerId === props.organizationId) return true;
  return false;
}

// Utility functions with explicit return types
function getStatusClass(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'uploaded':
    default:
      return 'bg-blue-100 text-blue-800';
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
</script>