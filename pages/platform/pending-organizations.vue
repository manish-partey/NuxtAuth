<script setup lang="ts">
import { ref, onMounted } from 'vue';

definePageMeta({
  middleware: ['auth-guard'],
  roles: ['platform_admin']
});

interface Organization {
  _id: string;
  name: string;
  slug: string;
  status: 'pending' | 'approved' | 'rejected';
  typeName: string;
  description: string;
  createdByName: string;
  createdByEmail: string;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  approvedByName?: string;
  rejectedByName?: string;
}

const organizations = ref<Organization[]>([]);
const loading = ref(false);
const error = ref('');
const selectedStatus = ref('pending');
const processingOrg = ref<string | null>(null);
const rejectionModal = ref<{ show: boolean; orgId: string | null; reason: string }>({
  show: false,
  orgId: null,
  reason: ''
});

async function fetchOrganizations() {
  loading.value = true;
  error.value = '';
  try {
    const response: any = await $fetch('/api/platform/pending-organizations', {
      query: { status: selectedStatus.value },
      credentials: 'include'
    });

    if (response.success) {
      organizations.value = response.organizations || [];
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to load organizations';
  } finally {
    loading.value = false;
  }
}

async function approveOrganization(orgId: string) {
  if (!confirm('Are you sure you want to approve this organization?')) return;

  processingOrg.value = orgId;
  try {
    const response: any = await $fetch(`/api/platform/organizations/${orgId}/approve`, {
      method: 'POST',
      credentials: 'include'
    });

    if (response.success) {
      alert('Organization approved successfully!');
      fetchOrganizations();
    }
  } catch (e: any) {
    alert(e.data?.message || 'Failed to approve organization');
  } finally {
    processingOrg.value = null;
  }
}

function showRejectModal(orgId: string) {
  rejectionModal.value = {
    show: true,
    orgId,
    reason: ''
  };
}

async function rejectOrganization() {
  if (!rejectionModal.value.orgId) return;
  
  if (rejectionModal.value.reason.trim().length < 10) {
    alert('Please provide a detailed rejection reason (minimum 10 characters)');
    return;
  }

  processingOrg.value = rejectionModal.value.orgId;
  try {
    const response: any = await $fetch(`/api/platform/organizations/${rejectionModal.value.orgId}/reject`, {
      method: 'POST',
      body: { reason: rejectionModal.value.reason },
      credentials: 'include'
    });

    if (response.success) {
      alert('Organization rejected');
      rejectionModal.value = { show: false, orgId: null, reason: '' };
      fetchOrganizations();
    }
  } catch (e: any) {
    alert(e.data?.message || 'Failed to reject organization');
  } finally {
    processingOrg.value = null;
  }
}

onMounted(fetchOrganizations);
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Organization Approvals</h1>
        <p class="text-gray-600">Review and approve organization registration requests</p>
      </div>
    </div>

    <!-- Status Filter -->
    <div class="mb-6">
      <div class="flex space-x-2">
        <button 
          v-for="status in [{ value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }, { value: 'all', label: 'All' }]"
          :key="status.value"
          @click="selectedStatus = status.value; fetchOrganizations()"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition',
            selectedStatus === status.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          {{ status.label }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-gray-500">Loading organizations...</div>
    <div v-if="error" class="text-red-600 mb-4">{{ error }}</div>

    <div v-if="!loading && organizations.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
      <p class="text-gray-500">No organizations found with status: {{ selectedStatus }}</p>
    </div>

    <!-- Organizations List -->
    <div v-if="!loading && organizations.length > 0" class="space-y-4">
      <div v-for="org in organizations" :key="org._id" 
        class="bg-white border rounded-lg p-6 hover:shadow-md transition">
        
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-xl font-semibold">{{ org.name }}</h3>
              <span :class="[
                'px-3 py-1 text-xs font-semibold rounded-full',
                org.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                org.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              ]">
                {{ org.status.toUpperCase() }}
              </span>
            </div>
            
            <p class="text-sm text-gray-600 mb-3">{{ org.description || 'No description provided' }}</p>
            
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">Type:</span>
                <span class="ml-2 font-medium">{{ org.typeName }}</span>
              </div>
              <div>
                <span class="text-gray-500">Created by:</span>
                <span class="ml-2 font-medium">{{ org.createdByName }}</span>
              </div>
              <div>
                <span class="text-gray-500">Email:</span>
                <span class="ml-2 font-medium">{{ org.createdByEmail }}</span>
              </div>
              <div>
                <span class="text-gray-500">Registered:</span>
                <span class="ml-2 font-medium">{{ new Date(org.createdAt).toLocaleDateString() }}</span>
              </div>
              
              <div v-if="org.status === 'approved' && org.approvedAt">
                <span class="text-gray-500">Approved:</span>
                <span class="ml-2 font-medium">{{ new Date(org.approvedAt).toLocaleDateString() }}</span>
              </div>
              <div v-if="org.status === 'approved' && org.approvedByName">
                <span class="text-gray-500">Approved by:</span>
                <span class="ml-2 font-medium">{{ org.approvedByName }}</span>
              </div>
              
              <div v-if="org.status === 'rejected' && org.rejectedAt">
                <span class="text-gray-500">Rejected:</span>
                <span class="ml-2 font-medium">{{ new Date(org.rejectedAt).toLocaleDateString() }}</span>
              </div>
              <div v-if="org.status === 'rejected' && org.rejectionReason" class="col-span-2">
                <span class="text-gray-500">Reason:</span>
                <span class="ml-2 font-medium text-red-600">{{ org.rejectionReason }}</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div v-if="org.status === 'pending'" class="flex space-x-2 ml-4">
            <button 
              @click="approveOrganization(org._id)"
              :disabled="processingOrg === org._id"
              class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ processingOrg === org._id ? 'Processing...' : 'Approve' }}
            </button>
            <button 
              @click="showRejectModal(org._id)"
              :disabled="processingOrg === org._id"
              class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Rejection Modal -->
    <div v-if="rejectionModal.show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold mb-4">Reject Organization</h3>
        <p class="text-gray-600 mb-4">Please provide a detailed reason for rejection:</p>
        <textarea 
          v-model="rejectionModal.reason"
          class="w-full border rounded p-2 mb-4 h-32"
          placeholder="Enter rejection reason (minimum 10 characters)..."
        ></textarea>
        <div class="flex justify-end space-x-2">
          <button 
            @click="rejectionModal = { show: false, orgId: null, reason: '' }"
            class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button 
            @click="rejectOrganization"
            :disabled="rejectionModal.reason.trim().length < 10"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
