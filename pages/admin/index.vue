<template>
  <div class="max-w-5xl mx-auto py-10 px-4">
    <div class="mb-8">
      <h1 class="text-4xl font-semibold text-gray-800 mb-2">Admin Dashboard</h1>
      <p v-if="authStore.user" class="text-gray-700">
        Welcome, <span class="font-medium">{{ authStore.user.name }}</span> (Admin)
      </p>
      <p v-else class="text-gray-500 italic">Loading admin data...</p>
    </div>

    <div class="bg-white rounded-xl shadow-md p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-semibold text-gray-800">Manage Users</h2>
        <button @click="fetchUsers"
          class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition">
          Fetch All Users
        </button>
      </div>

      <p class="text-gray-600 mb-4">
        This section is restricted to users with the <code class="bg-gray-100 px-1 rounded">admin</code> role.
      </p>

      <div v-if="users.length" class="mt-4">
        <ul class="divide-y divide-gray-200">
          <li v-for="user in users" :key="user.id" class="py-2 flex justify-between items-center">
            <div>
              <p class="font-semibold text-gray-800">{{ user.name }}</p>
              <p class="text-sm text-gray-600">{{ user.email }}</p>
            </div>
            <span class="inline-block px-3 py-1 text-xs font-medium rounded-full" :class="{
              'bg-blue-100 text-blue-800': user.role === 'admin',
              'bg-gray-100 text-gray-700': user.role === 'user'
            }">
              {{ user.role }}
            </span>
          </li>
        </ul>
      </div>

      <p v-if="adminError" class="text-red-600 mt-4">{{ adminError }}</p>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { ref, onMounted } from 'vue';

const authStore = useAuthStore();
const users = ref([]);
const adminError = ref('');

const fetchUsers = async () => {
  adminError.value = '';
  try {
    const response = await $fetch('/api/user');
    users.value = response.users;
  } catch (error) {
    adminError.value = error.statusMessage || 'Failed to fetch users.';
  }
};

onMounted(async () => {
  if (!authStore.user && !authStore.loading) {
    await authStore.fetchUser();
  }
});

definePageMeta({
  middleware: ['auth', 'admin'],
});
</script>
