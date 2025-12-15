<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const orgId = route.params.orgId as string

const organization = ref<any>(null)
const users = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const actionLoading = ref(false)
const successMessage = ref('')
const showRejectModal = ref(false)
const rejectionReason = ref('')
const rejectionError = ref('')

onMounted(async () => {
  await fetchOrganizationDetails()
})

async function fetchOrganizationDetails() {
  loading.value = true
  error.value = ''
  
  try {
    // Fetch organization details
    const orgResponse: any = await $fetch(`/api/platform/organizations/${orgId}`)
    if (orgResponse.success) {
      organization.value = orgResponse.organization
    }

    // Fetch organization users
    const usersResponse: any = await $fetch(`/api/platform/organizations/${orgId}/users`)
    if (usersResponse.success) {
      users.value = usersResponse.users
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to load organization details'
    console.error('Error fetching organization:', e)
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/platform/organizations')
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getRoleBadgeClass(role: string) {
  switch (role) {
    case 'organization_admin':
      return 'bg-purple-100 text-purple-800'
    case 'manager':
      return 'bg-blue-100 text-blue-800'
    case 'employee':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

async function approveOrganization() {
  if (!confirm('Are you sure you want to approve this organization?')) {
    return
  }

  actionLoading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const response: any = await $fetch(`/api/platform/organizations/${orgId}/approve`, {
      method: 'POST',
      credentials: 'include'
    })

    if (response.success) {
      successMessage.value = 'Organization approved successfully! User accounts have been activated.'
      await fetchOrganizationDetails()
    }
  } catch (e: any) {
    error.value = e.data?.message || e.message || 'Failed to approve organization'
    console.error('Approve error:', e)
  } finally {
    actionLoading.value = false
  }
}

function openRejectModal() {
  rejectionReason.value = ''
  rejectionError.value = ''
  showRejectModal.value = true
}

function closeRejectModal() {
  showRejectModal.value = false
  rejectionReason.value = ''
  rejectionError.value = ''
}

async function rejectOrganization() {
  rejectionError.value = ''

  if (!rejectionReason.value || rejectionReason.value.trim().length < 10) {
    rejectionError.value = 'Rejection reason must be at least 10 characters'
    return
  }

  actionLoading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const response: any = await $fetch(`/api/platform/organizations/${orgId}/reject`, {
      method: 'POST',
      body: { reason: rejectionReason.value.trim() },
      credentials: 'include'
    })

    if (response.success) {
      successMessage.value = 'Organization rejected. Notification email sent to the registrant.'
      closeRejectModal()
      await fetchOrganizationDetails()
    }
  } catch (e: any) {
    rejectionError.value = e.data?.message || e.message || 'Failed to reject organization'
    console.error('Reject error:', e)
  } finally {
    actionLoading.value = false
  }
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <button
        @click="goBack"
        class="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Back to Organizations
      </button>
      
      <h1 class="text-3xl font-bold text-gray-900">Organization Details</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading organization details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <p class="text-green-800 font-medium">{{ successMessage }}</p>
      </div>
    </div>

    <!-- Organization Details -->
    <div v-else-if="organization" class="space-y-6">
      <!-- Pending Actions Banner -->
      <div v-if="organization.status === 'pending'" class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div class="flex items-start">
          <svg class="w-5 h-5 text-yellow-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <div class="flex-1">
            <p class="text-yellow-800 font-medium mb-2">This organization is pending approval</p>
            <div class="flex gap-3">
              <button
                @click="approveOrganization"
                :disabled="actionLoading"
                class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                {{ actionLoading ? 'Processing...' : 'Approve Organization' }}
              </button>
              <button
                @click="openRejectModal"
                :disabled="actionLoading"
                class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                {{ actionLoading ? 'Processing...' : 'Reject Organization' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Basic Info Card -->
      <div class="bg-white shadow-md rounded-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-semibold text-gray-900">{{ organization.name }}</h2>
          <span
            :class="getStatusBadgeClass(organization.status)"
            class="px-3 py-1 rounded-full text-sm font-medium"
          >
            {{ organization.status.toUpperCase() }}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600">Organization Type</p>
            <p class="text-lg font-medium text-gray-900">{{ organization.typeString || 'N/A' }}</p>
          </div>

          <div>
            <p class="text-sm text-gray-600">Slug</p>
            <p class="text-lg font-medium text-gray-900">{{ organization.slug }}</p>
          </div>

          <div v-if="organization.description">
            <p class="text-sm text-gray-600">Description</p>
            <p class="text-lg text-gray-900">{{ organization.description }}</p>
          </div>

          <div>
            <p class="text-sm text-gray-600">Created At</p>
            <p class="text-lg text-gray-900">{{ new Date(organization.createdAt).toLocaleDateString() }}</p>
          </div>

          <div v-if="organization.approvedAt">
            <p class="text-sm text-gray-600">Approved At</p>
            <p class="text-lg text-gray-900">{{ new Date(organization.approvedAt).toLocaleDateString() }}</p>
          </div>

          <div v-if="organization.rejectedAt">
            <p class="text-sm text-gray-600">Rejected At</p>
            <p class="text-lg text-gray-900">{{ new Date(organization.rejectedAt).toLocaleDateString() }}</p>
          </div>

          <div v-if="organization.rejectionReason" class="md:col-span-2">
            <p class="text-sm text-gray-600">Rejection Reason</p>
            <p class="text-lg text-red-600">{{ organization.rejectionReason }}</p>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white shadow-md rounded-lg p-6">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">
          Organization Users ({{ users.length }})
        </h3>

        <div v-if="users.length === 0" class="text-center py-8 text-gray-600">
          No users found in this organization
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user._id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600">{{ user.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="getRoleBadgeClass(user.role)"
                    class="px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {{ user.role.replace('_', ' ').toUpperCase() }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="getStatusBadgeClass(user.status)"
                    class="px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {{ user.status.toUpperCase() }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ new Date(user.createdAt).toLocaleDateString() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-gray-900">Reject Organization</h3>
          <button @click="closeRejectModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="mb-4">
          <p class="text-gray-600 mb-4">Please provide a reason for rejecting this organization registration. This will be sent to the registrant.</p>
          
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Rejection Reason *
          </label>
          <textarea
            v-model="rejectionReason"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            rows="4"
            placeholder="Please explain why this organization cannot be approved..."
            :disabled="actionLoading"
          ></textarea>
          <p class="text-sm text-gray-500 mt-1">Minimum 10 characters</p>
          
          <div v-if="rejectionError" class="mt-2 text-sm text-red-600">
            {{ rejectionError }}
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <button
            @click="closeRejectModal"
            :disabled="actionLoading"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            @click="rejectOrganization"
            :disabled="actionLoading"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {{ actionLoading ? 'Rejecting...' : 'Reject Organization' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
