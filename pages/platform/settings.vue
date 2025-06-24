<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['platform_admin'],
})

import { reactive, ref, watchEffect } from 'vue'

const form = reactive({
  name: '',
  slug: '',
  description: '',
  status: 'active',
})

const message = ref('')
const success = ref(false)

const { data, error, pending } = await useFetch('/api/platform/settings/get', {
  credentials: 'include',
})

// ✅ Use watchEffect to wait for data to arrive before updating form
watchEffect(() => {
  if (data.value?.settings) {
    const s = data.value.settings
    form.name = s.name || ''
    form.slug = s.slug || ''
    form.description = s.description || ''
    form.status = s.status || 'active'
  }
})

const updateSettings = async () => {
  message.value = ''
  success.value = false

  try {
    await $fetch('/api/platform/settings/update', {
      method: 'POST',
      body: form,
      credentials: 'include',
    })
    success.value = true
    message.value = 'Platform settings updated successfully.'
  } catch (err) {
    console.error('Save error:', err)
    message.value = 'Failed to update settings.'
    success.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Platform Settings</h1>

    <div v-if="pending" class="text-gray-600">Loading settings...</div>
    <div v-else-if="error" class="text-red-600 font-semibold">Failed to load settings.</div>

    <form
      v-else
      @submit.prevent="updateSettings"
      class="space-y-6 bg-white border border-gray-200 rounded-xl shadow p-6"
    >
      <div>
        <label class="block text-sm font-medium text-gray-700">Name</label>
        <input
          v-model="form.name"
          type="text"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Slug</label>
        <input
          v-model="form.slug"
          type="text"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          v-model="form.description"
          rows="4"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Status</label>
        <select
          v-model="form.status"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div class="flex items-center gap-4">
        <button
          type="submit"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Save Settings
        </button>
        <span v-if="message" :class="success ? 'text-green-600' : 'text-red-600'">
          {{ message }}
        </span>
      </div>
    </form>
  </div>
</template>
