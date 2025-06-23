<!-- /platform/invites.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['platform_admin'],
});

const { data, error, pending } = await useFetch('/api/org/invites', {
  credentials: 'include',
});
</script>

<template>
  <div class="max-w-6xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Invitations</h1>

    <div v-if="pending" class="text-gray-600">Loading invites...</div>
    <div v-else-if="error" class="text-red-600 font-semibold">Failed to load invites.</div>

    <div v-else-if="data?.invites?.length">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-100 text-left">
            <th class="py-2 px-4">Email</th>
            <th class="py-2 px-4">Role</th>
            <th class="py-2 px-4">Organization</th>
            <th class="py-2 px-4">Status</th>
            <th class="py-2 px-4">Created At</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="invite in data.invites" :key="invite._id" class="border-b hover:bg-gray-50">
            <td class="py-2 px-4">{{ invite.email }}</td>
            <td class="py-2 px-4">{{ invite.role }}</td>
            <td class="py-2 px-4">{{ invite.organizationName || 'N/A' }}</td>
            <td class="py-2 px-4">{{ invite.status }}</td>
            <td class="py-2 px-4">{{ new Date(invite.createdAt).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-gray-500">No invitations found.</div>
  </div>
</template>