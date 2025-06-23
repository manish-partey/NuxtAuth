<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['platform_admin'],
});

const { data, error, pending } = await useFetch('/api/platform/users', {
  credentials: 'include',
});
</script>

<template>
  <div class="max-w-6xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Platform Users</h1>

    <div v-if="pending" class="text-gray-600">Loading users...</div>
    <div v-else-if="error" class="text-red-600 font-semibold">Failed to load users.</div>

    <div v-else>
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-100 text-left">
            <th class="py-2 px-4">Name</th>
            <th class="py-2 px-4">Email</th>
            <th class="py-2 px-4">Role</th>
            <th class="py-2 px-4">Organization</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in data.users" :key="user._id" class="border-b hover:bg-gray-50">
            <td class="py-2 px-4">{{ user.name }}</td>
            <td class="py-2 px-4">{{ user.email }}</td>
            <td class="py-2 px-4">{{ user.role }}</td>
            <td class="py-2 px-4">{{ user.organizationName || 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>