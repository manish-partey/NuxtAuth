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

    <!-- Organization Details -->
    <div v-else-if="organization" class="space-y-6">
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
  </div>
</template>
