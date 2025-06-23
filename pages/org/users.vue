<script setup lang="ts">
import { ref } from 'vue'
import { useFetch, useRequestHeaders } from '#app'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['organization_admin'],
})

interface OrgUser {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
}

const users = ref<OrgUser[]>([])
const error = ref<string | null>(null)
const loading = ref(true)

try {
  const { data, error: fetchError } = await useFetch<{ success: boolean; users: OrgUser[] }>('/api/org/users', {
    headers: useRequestHeaders(['cookie']),
  })

  if (fetchError.value) {
    error.value = 'Failed to load users'
  } else if (data.value?.success && data.value.users) {
    users.value = data.value.users
  }
} catch (err) {
  error.value = 'An unexpected error occurred'
} finally {
  loading.value = false
}
</script>

<template>
  <div class="max-w-5xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-semibold text-gray-800 mb-6">Organization Users</h1>

    <div v-if="loading" class="text-gray-600">Loading users...</div>
    <div v-else-if="error" class="text-red-600 font-semibold">{{ error }}</div>
    <div v-else-if="users.length === 0" class="text-gray-600 italic">No users found.</div>

    <div v-else class="space-y-4">
      <div
        v-for="user in users"
        :key="user._id"
        class="p-4 bg-white rounded-xl shadow flex flex-col md:flex-row justify-between items-start md:items-center"
      >
        <div>
          <p class="text-lg font-medium text-gray-900">{{ user.name || 'No Name' }}</p>
          <p class="text-sm text-gray-600">{{ user.email }}</p>
          <p class="text-sm text-gray-500">Role: {{ user.role }}</p>
        </div>
        <p class="text-sm text-gray-400 mt-2 md:mt-0">Joined: {{ new Date(user.createdAt).toLocaleDateString() }}</p>
      </div>
    </div>
  </div>
</template>
