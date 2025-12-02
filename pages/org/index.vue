<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
const organizationId = auth.userOrgId

console.log('Organization ID:', organizationId) // Debug log

interface Organization {
  name: string
  // add other properties as needed
}

const { data: organization, error } = await useAsyncData<Organization>('organization', () => {
  if (!organizationId) {
    throw new Error('No organization ID found')
  }
  return $fetch<Organization>(`/api/organization/${organizationId}`)
})

console.log('Organization data:', organization.value) // Debug log
console.log('Error:', error.value) // Debug log
</script>

<template>
  <div class="max-w-6xl mx-auto py-10 px-4">
    <div class="mb-4 text-lg font-semibold">
      Organization Name: 
      <span v-if="!organizationId">No organization assigned</span>
      <span v-else-if="error">Organization not found (ID: {{ organizationId }})</span>
      <span v-else-if="organization">{{ organization.name }}</span>
      <span v-else>Loading...</span>
    </div>
    <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
    

      <NuxtLink to="/org/users" class="org-card">
        <h2 class="text-xl font-semibold">👥 Users</h2>
        <p class="text-sm text-gray-600">View and manage all users in your organization.</p>
      </NuxtLink>

         <NuxtLink to="/organization-register" class="dashboard-card">
          <h2 class="text-xl font-semibold">Create Organization</h2>
          <p class="text-sm text-gray-600">Register new organizations in the system.</p>
        </NuxtLink>

      <NuxtLink to="/org/invites" class="org-card">
        <h2 class="text-xl font-semibold">✉️ Invitations</h2>
        <p class="text-sm text-gray-600">Send invites to new members and track their status.</p>
      </NuxtLink>

      <NuxtLink to="/org/settings" class="org-card">
        <h2 class="text-xl font-semibold">⚙️ Settings</h2>
        <p class="text-sm text-gray-600">Update organization name and preferences.</p>
      </NuxtLink>
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


