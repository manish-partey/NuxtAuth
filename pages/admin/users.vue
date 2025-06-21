<script setup lang="ts">
const { data: users, pending, error } = await useFetch('/api/user/list', { credentials: 'include', headers: useRequestHeaders(['cookie']) });

if (error.value) {
  console.error('Failed to fetch users:', error.value);
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">All Users</h1>

    <div v-if="pending">Loading...</div>

    <div v-else>
      <table class="min-w-full border bg-white">
        <thead>
          <tr class="bg-gray-100">
            <th class="text-left p-2">Name</th>
            <th class="text-left p-2">Email</th>
            <th class="text-left p-2">Role</th>
            <th class="text-left p-2">Organization</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user._id" class="border-t">
            <td class="p-2">{{ user.name }}</td>
            <td class="p-2">{{ user.email }}</td>
            <td class="p-2 capitalize">{{ user.role }}</td>
            <td class="p-2">{{ user.organization?.name || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
