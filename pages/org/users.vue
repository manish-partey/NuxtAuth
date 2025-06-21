<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['organization_admin'],
})

interface User {
  _id: string
  name: string
  email: string
  role: string
}

const users = ref<User[]>([])
const errorMessage = ref('')
const loading = ref(true)

onMounted(async () => {
  try {
    const authStore = useAuthStore()
    const orgId = authStore.user?.organizationId

    if (!orgId) {
      errorMessage.value = 'Organization not found for current user.'
      return
    }

    const { data, error } = await useFetch(`/api/org/listUsers?organizationId=${orgId}`, {
      headers: useRequestHeaders(['cookie']),
    })

    if (error.value) {
      errorMessage.value = 'Failed to load users.'
    } else if (data.value?.users) {
      users.value = data.value.users
    }
  } catch {
    errorMessage.value = 'Unexpected error occurred while loading users.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-5xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Manage Organization Users</h1>

    <div v-if="loading" class="text-gray-600">Loading users...</div>

    <div v-else-if="errorMessage" class="text-red-600 font-semibold">
      {{ errorMessage }}
    </div>

    <div v-else-if="users.length" class="space-y-4">
      <div
        v-for="user in users"
        :key="user._id"
        class="p-4 bg-white rounded-2xl shadow border border-gray-100"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-lg font-semibold text-gray-900">{{ user.name }}</p>
            <p class="text-sm text-gray-600">Email: {{ user.email }}</p>
            <p class="text-sm text-gray-500">Role: {{ user.role }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-gray-600 italic">
      No users found in your organization.
    </div>
  </div>
</template>
