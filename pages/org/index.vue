<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
const organizationId = auth.userOrgId

interface Organization {
  name: string
  // add other properties as needed
}

const { data: organization } = await useAsyncData<Organization>('organization', () =>
  $fetch<Organization>(`/api/organization/${organizationId}`)
)
</script>

<template>
  <div class="max-w-6xl mx-auto py-10 px-4">
    <div class="mb-4 text-lg font-semibold">
      Organization Name: <span v-if="organization">{{ organization.name }}</span>
      <span v-else>Loading...</span>
    </div>
    <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink to="/org/requirements" class="org-card">
        <h2 class="text-xl font-semibold">📋 Document Requirements</h2>
        <p class="text-sm text-gray-600">View organization and user document requirements.</p>
      </NuxtLink>

      <NuxtLink to="/org/user-document-requirements" class="org-card">
        <h2 class="text-xl font-semibold">📝 Manage User Requirements</h2>
        <p class="text-sm text-gray-600">Set required/optional documents for user registration.</p>
      </NuxtLink>

      <NuxtLink to="/org/users" class="org-card">
        <h2 class="text-xl font-semibold">👥 Users</h2>
        <p class="text-sm text-gray-600">View and manage all users in your organization.</p>
      </NuxtLink>

      <NuxtLink to="/org/documents" class="org-card">
        <h2 class="text-xl font-semibold">📄 Documents</h2>
        <p class="text-sm text-gray-600">Review and manage document submissions from your users.</p>
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


