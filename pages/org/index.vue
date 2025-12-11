<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { ref, onMounted } from 'vue'

const auth = useAuthStore()
const organizationId = auth.userOrgId

console.log('Organization ID:', organizationId) // Debug log

interface Organization {
  name: string
  platformId?: {
    _id: string
    name: string
  }
  // add other properties as needed
}

const organization = ref<Organization | null>(null)
const error = ref<string | null>(null)
const loading = ref(true)

const fetchOrganization = async () => {
  try {
    loading.value = true
    error.value = null
    
    if (!organizationId) {
      throw new Error('No organization ID found')
    }
    
    const data = await $fetch<Organization>(`/api/organization/${organizationId}`)
    organization.value = data
  } catch (err: any) {
    console.error('Failed to fetch organization:', err)
    error.value = err.message || 'Failed to load organization'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOrganization()
})

console.log('Organization data:', organization.value) // Debug log
console.log('Error:', error.value) // Debug log
</script>

<template>
  <div class="max-w-6xl mx-auto py-10 px-4">
    <div class="mb-6 bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="text-sm font-medium text-gray-600">Organization Name</label>
          <div class="text-lg font-semibold text-gray-900">
            <span v-if="loading">Loading...</span>
            <span v-else-if="!organizationId">No organization assigned</span>
            <span v-else-if="error">Organization not found</span>
            <span v-else-if="organization">{{ organization.name }}</span>
            <span v-else>Unknown</span>
          </div>
        </div>
        <div v-if="organization?.platformId">
          <label class="text-sm font-medium text-gray-600">Platform</label>
          <div class="text-lg font-semibold text-blue-700">{{ organization.platformId.name }}</div>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-600">Your Role</label>
          <div class="text-lg font-semibold text-purple-700 capitalize">
            {{ auth.user?.role?.replace('_', ' ') || 'N/A' }}
          </div>
        </div>
      </div>
    </div>
    <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
    

      

       

     

     
    </div>
  </div>
</template>

<style lang="postcss" scoped>
@layer components {
  .org-card {
    @apply bg-white rounded-2xl shadow p-6 hover:bg-gray-50 transition;
  }
}
</style>


