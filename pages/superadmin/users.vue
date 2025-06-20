<script setup lang="ts">
import { ref, onMounted } from 'vue';

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['super_admin'],
});

const users = ref<any[]>([]);
const loading = ref(false);
const error = ref('');

const fetchUsers = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await $fetch('/api/user/list', {
      credentials: 'include' // ✅ Ensure cookies (like JWT token) are sent
    });
    if (res.success) {
      users.value = res.users;
    } else {
      error.value = 'Failed to load users.';
    }
  } catch (e) {
    error.value = 'An error occurred while fetching users.';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUsers);
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Manage Users</h1>
    <p class="mb-4">List of all users across the platform.</p>

    <div v-if="loading" class="text-gray-600">Loading users...</div>
    <div v-if="error" class="text-red-600">{{ error }}</div>

    <table v-if="!loading && users.length" class="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
      <thead class="bg-gray-100 border-b">
        <tr>
          <th class="text-left px-4 py-2">Name</th>
          <th class="text-left px-4 py-2">Email</th>
          <th class="text-left px-4 py-2">Role</th>
          <th class="text-left px-4 py-2">Organization</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user._id" class="border-b hover:bg-gray-50">
          <td class="px-4 py-2">{{ user.name }}</td>
          <td class="px-4 py-2">{{ user.email }}</td>
          <td class="px-4 py-2 capitalize">{{ user.role.replace(/_/g, ' ') }}</td>
          <td class="px-4 py-2">{{ user.organization?.name || 'N/A' }}</td>
        </tr>
      </tbody>
    </table>

    <p v-if="!loading && !users.length" class="text-gray-600 italic">No users found.</p>
  </div>
</template>
