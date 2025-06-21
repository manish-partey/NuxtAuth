<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useFetch, useRequestHeaders } from '#app'
import { useRouter } from 'vue-router'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['user'],
})

const authStore = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const loading = ref(true)
const saving = ref(false)
const message = ref('')
const error = ref('')

// Fetch user profile
try {
  const { credentials: 'include', headers: useRequestHeaders(['cookie']),  data, error: fetchError } = await useFetch('/api/user/me', {
    headers: useRequestHeaders(['cookie']),
  })

  if (fetchError.value) {
    error.value = 'Failed to load user profile'
  } else if (data.value?.user) {
    name.value = data.value.user.username || ''
    email.value = data.value.user.email || ''
  }
} catch (err: any) {
  error.value = 'Something went wrong loading profile.'
} finally {
  loading.value = false
}

// Save updated profile
async function updateProfile() {
  saving.value = true
  message.value = ''
  error.value = ''

  try {
    const response = await $fetch('/api/user/update', {
      method: 'POST',
      body: {
        userId: authStore.user?.id,
        name: name.value,
        email: email.value,
      },
    })

    if (response.success) {
      message.value = 'Profile updated successfully.'
      await authStore.fetchUser() // refresh local store
    } else {
      error.value = 'Failed to update profile.'
    }
  } catch (e) {
    error.value = 'Update failed. Please try again.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-semibold text-gray-800 mb-6">User Profile</h1>
    <p class="mb-8 text-gray-600">Manage your personal profile information below.</p>

    <div v-if="loading" class="text-gray-500">Loading...</div>

    <div v-else>
      <form @submit.prevent="updateProfile" class="space-y-6">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            id="name"
            v-model="name"
            type="text"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring focus:ring-blue-200"
          />
        </div>

        <div class="flex items-center space-x-4">
          <button
            type="submit"
            :disabled="saving"
            class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md shadow transition"
          >
            {{ saving ? 'Saving...' : 'Update Profile' }}
          </button>

          <span v-if="message" class="text-green-600 text-sm">{{ message }}</span>
          <span v-if="error" class="text-red-600 text-sm">{{ error }}</span>
        </div>
      </form>
    </div>
  </div>
</template>