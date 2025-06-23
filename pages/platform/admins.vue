<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['platform_admin']
})

const { data, error, refresh } = await useFetch('/api/platform/listAdmins', {
  credentials: 'include',
  headers: useRequestHeaders(['cookie']),
})

const loading = ref(false)

const handleRemoveAdmin = async (userId: string) => {
  if (!confirm('Are you sure you want to remove this admin?')) return

  loading.value = true
  try {
    const res = await $fetch('/api/platform/removeAdmin', {
      method: 'POST',
      body: { userId },
      credentials: 'include',
    })
    if (res.success) {
      refresh()
    }
  } catch (err) {
    alert('Failed to remove admin.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Organization Admins</h1>

    <div v-if="error" class="text-red-600">Failed to load admins.</div>
    <div v-else-if="!data?.admins?.length" class="text-gray-600">No organization admins found.</div>
    <div v-else class="space-y-4">
      <div
        v-for="admin in data.admins"
        :key="admin._id"
        class="p-4 bg-white rounded-xl shadow flex justify-between items-center"
      >
        <div>
          <p class="font-semibold">{{ admin.name }}</p>
          <p class="text-sm text-gray-600">{{ admin.email }}</p>
          <p class="text-sm text-gray-500">Org: {{ admin.organizationName }}</p>
        </div>

        <button
          class="text-red-600 hover:underline"
          @click="handleRemoveAdmin(admin._id)"
          :disabled="loading"
        >
          Remove
        </button>
      </div>
    </div>
  </div>
</template>
