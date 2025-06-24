<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['platform_admin'],
})

const form = reactive({
  name: '',
  slug: '',
  description: '',
  status: 'active',
})

const { data, error, pending } = await useFetch('/api/platform/settings/get', {
  credentials: 'include',
})

if (data.value?.settings) {
  const s = data.value.settings
  form.name = s.name || ''
  form.slug = s.slug || ''
  form.description = s.description || ''
  form.status = s.status || 'active'
}
</script>

<template>
  <div class="max-w-3xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Platform Settings</h1>

    <div v-if="pending" class="text-gray-600">Loading settings...</div>
    <div v-else-if="error" class="text-red-600 font-semibold">Failed to load settings.</div>

    <form v-else class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700">Name</label>
        <input v-model="form.name" type="text"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Slug</label>
        <input v-model="form.slug" type="text"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Description</label>
        <textarea v-model="form.description"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Status</label>
        <select v-model="form.status"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </form>
  </div>
</template>