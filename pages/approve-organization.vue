<!-- pages/approve-organization.vue -->
<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Organization Approval
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Review and approve organization registration
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div class="inline-flex items-center">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span class="ml-2 text-gray-600">Loading organization details...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Success State -->
      <div v-else-if="success" class="bg-green-50 border border-green-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800">Success!</h3>
            <p class="mt-1 text-sm text-green-700">{{ successMessage }}</p>
          </div>
        </div>
        <div class="mt-4">
          <NuxtLink to="/login" class="text-sm text-green-600 hover:text-green-500 underline">
            Go to Login Page
          </NuxtLink>
        </div>
      </div>

      <!-- Organization Details -->
      <div v-else-if="organization && !actionTaken" class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            Organization Details
          </h3>
        </div>
        
        <div class="px-6 py-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Organization Name</label>
            <p class="mt-1 text-sm text-gray-900">{{ organization.name }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Type</label>
            <p class="mt-1 text-sm text-gray-900">{{ organization.type }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Domain</label>
            <p class="mt-1 text-sm text-gray-900">{{ organization.domain }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Admin Name</label>
            <p class="mt-1 text-sm text-gray-900">{{ organization.adminName }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Admin Email</label>
            <p class="mt-1 text-sm text-gray-900">{{ organization.adminEmail }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Platform</label>
            <p class="mt-1 text-sm text-gray-900">{{ organization.platformName }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Requested On</label>
            <p class="mt-1 text-sm text-gray-900">{{ formatDate(organization.createdAt) }}</p>
          </div>
        </div>

        <!-- Rejection Reason Input -->
        <div v-if="showRejectionReason" class="px-6 py-4 border-t border-gray-200">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Rejection Reason
          </label>
          <textarea 
            v-model="rejectionReason"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Please provide a reason for rejection..."
          ></textarea>
        </div>

        <!-- Action Buttons -->
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button 
            v-if="showRejectionReason"
            @click="cancelRejection"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            v-else
            @click="startRejection"
            class="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
          >
            Reject
          </button>
          <button 
            @click="showRejectionReason ? confirmRejection() : approveOrganization()"
            :disabled="showRejectionReason && !rejectionReason.trim()"
            class="px-4 py-2 rounded-md transition-colors"
            :class="showRejectionReason 
              ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400' 
              : 'bg-green-600 text-white hover:bg-green-700'"
          >
            {{ showRejectionReason ? 'Confirm Rejection' : 'Approve Organization' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const { orgId, token } = route.query

const loading = ref(true)
const error = ref('')
const success = ref(false)
const successMessage = ref('')
const organization = ref(null)
const actionTaken = ref(false)
const showRejectionReason = ref(false)
const rejectionReason = ref('')

const loadOrganization = async () => {
  if (!orgId) {
    error.value = 'Organization ID is required'
    loading.value = false
    return
  }

  try {
    const response = await $fetch(`/api/platform/organization/details?orgId=${orgId}`)
    if (response.success) {
      organization.value = response.organization
    } else {
      error.value = response.message || 'Organization not found'
    }
  } catch (err) {
    error.value = err.data?.message || 'Failed to load organization details'
  } finally {
    loading.value = false
  }
}

const approveOrganization = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/platform/organization/public-approve', {
      method: 'POST',
      body: {
        organizationId: orgId,
        action: 'approve'
      }
    })
    
    if (response.success) {
      success.value = true
      successMessage.value = response.message
      actionTaken.value = true
    }
  } catch (err) {
    error.value = err.data?.message || 'Failed to approve organization'
  } finally {
    loading.value = false
  }
}

const startRejection = () => {
  showRejectionReason.value = true
}

const cancelRejection = () => {
  showRejectionReason.value = false
  rejectionReason.value = ''
}

const confirmRejection = async () => {
  if (!rejectionReason.value.trim()) return

  try {
    loading.value = true
    const response = await $fetch('/api/platform/organization/public-approve', {
      method: 'POST',
      body: {
        organizationId: orgId,
        action: 'reject',
        rejectionReason: rejectionReason.value
      }
    })
    
    if (response.success) {
      success.value = true
      successMessage.value = response.message
      actionTaken.value = true
    }
  } catch (err) {
    error.value = err.data?.message || 'Failed to reject organization'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadOrganization()
})
</script>
