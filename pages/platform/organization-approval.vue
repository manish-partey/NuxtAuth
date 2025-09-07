<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Organization Approvals</h1>
            <p class="text-sm text-gray-600">Review and approve organization registration requests</p>
          </div>
          <div class="flex space-x-4">
            <select v-model="statusFilter" @change="loadOrganizations" 
              class="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button @click="loadOrganizations" 
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-2 text-gray-600">Loading organizations...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="organizations.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No {{ statusFilter }} organizations</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ statusFilter === 'pending' ? 'No pending organization registrations at this time.' : `No ${statusFilter} organizations found.` }}
        </p>
      </div>

      <!-- Organizations List -->
      <div v-else class="space-y-6">
        <div v-for="org in organizations" :key="org.id" 
          class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-medium text-gray-900">{{ org.name }}</h3>
                <p class="text-sm text-gray-500">{{ org.type }} • {{ org.domain }}</p>
              </div>
              <div class="flex items-center space-x-2">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusClass(org.status)">
                  {{ org.status }}
                </span>
                <span class="text-xs text-gray-500">
                  {{ formatDate(org.createdAt) }}
                </span>
              </div>
            </div>
          </div>

          <div class="px-6 py-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 class="text-sm font-medium text-gray-900 mb-2">Admin Details</h4>
                <div class="space-y-1">
                  <p class="text-sm text-gray-600">
                    <span class="font-medium">Name:</span> {{ org.admin.name }}
                  </p>
                  <p class="text-sm text-gray-600">
                    <span class="font-medium">Email:</span> {{ org.admin.email }}
                  </p>
                </div>
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-900 mb-2">Platform</h4>
                <p class="text-sm text-gray-600">{{ org.platform.name }}</p>
              </div>
            </div>

            <!-- Action Buttons for Pending Organizations -->
            <div v-if="org.status === 'pending'" class="mt-6 flex justify-end space-x-3">
              <button @click="rejectOrganization(org)" 
                class="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition">
                Reject
              </button>
              <button @click="approveOrganization(org)" 
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rejection Modal -->
    <div v-if="showRejectionModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Reject Organization</h3>
          <p class="text-sm text-gray-600 mb-4">
            Are you sure you want to reject "{{ selectedOrg?.name }}"? Please provide a reason:
          </p>
          <textarea v-model="rejectionReason" 
            placeholder="Please provide a reason for rejection..."
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none">
          </textarea>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button @click="closeRejectionModal" 
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition">
              Cancel
            </button>
            <button @click="confirmRejection" :disabled="!rejectionReason.trim()"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 transition">
              Reject Organization
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success/Error Message -->
    <div v-if="message" class="fixed bottom-4 right-4 max-w-sm">
      <div class="rounded-md p-4" :class="isSuccess ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg v-if="isSuccess" class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium" :class="isSuccess ? 'text-green-800' : 'text-red-800'">
              {{ message }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Meta
definePageMeta({
  middleware: 'role',
  requiredRole: 'platform_admin'
});

// Data
const organizations = ref([]);
const loading = ref(false);
const statusFilter = ref('pending');
const message = ref('');
const isSuccess = ref(false);

// Rejection modal
const showRejectionModal = ref(false);
const selectedOrg = ref(null);
const rejectionReason = ref('');

// Methods
const loadOrganizations = async () => {
  loading.value = true;
  try {
    const response = await $fetch(`/api/platform/organization/pending?status=${statusFilter.value}`);
    if (response.success) {
      organizations.value = response.organizations;
    }
  } catch (error) {
    console.error('Failed to load organizations:', error);
    showMessage('Failed to load organizations', false);
  } finally {
    loading.value = false;
  }
};

const approveOrganization = async (org) => {
  try {
    const response = await $fetch('/api/platform/organization/approve', {
      method: 'POST',
      body: {
        organizationId: org.id,
        action: 'approve'
      }
    });
    
    if (response.success) {
      showMessage(response.message, true);
      await loadOrganizations(); // Refresh list
    }
  } catch (error) {
    console.error('Failed to approve organization:', error);
    showMessage(error.data?.message || 'Failed to approve organization', false);
  }
};

const rejectOrganization = (org) => {
  selectedOrg.value = org;
  rejectionReason.value = '';
  showRejectionModal.value = true;
};

const confirmRejection = async () => {
  try {
    const response = await $fetch('/api/platform/organization/approve', {
      method: 'POST',
      body: {
        organizationId: selectedOrg.value.id,
        action: 'reject',
        rejectionReason: rejectionReason.value
      }
    });
    
    if (response.success) {
      showMessage(response.message, true);
      closeRejectionModal();
      await loadOrganizations(); // Refresh list
    }
  } catch (error) {
    console.error('Failed to reject organization:', error);
    showMessage(error.data?.message || 'Failed to reject organization', false);
  }
};

const closeRejectionModal = () => {
  showRejectionModal.value = false;
  selectedOrg.value = null;
  rejectionReason.value = '';
};

const showMessage = (msg, success) => {
  message.value = msg;
  isSuccess.value = success;
  setTimeout(() => {
    message.value = '';
  }, 5000);
};

const getStatusClass = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Lifecycle
onMounted(() => {
  loadOrganizations();
});
</script>
