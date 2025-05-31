<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold mb-6">Admin Dashboard</h1>
    <p v-if="authStore.user">
      Welcome, {{ authStore.user.name }} (Admin)!
    </p>
    <p v-else>Loading admin data...</p>

    <h2 class="text-xl font-bold mt-8 mb-4">Manage Users (Example)</h2>
    <div class="bg-white p-6 rounded shadow-md">
      <p>This is highly restricted content only for users with the 'admin' role.</p>
      <button @click="fetchUsers" class="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Fetch All Users</button>
      <div v-if="users.length">
        <h3 class="text-lg font-semibold mt-4">All Users:</h3>
        <ul>
          <li v-for="user in users" :key="user.id">
            {{ user.name }} ({{ user.email }}) - {{ user.role }}
          </li>
        </ul>
      </div>
      <p v-if="adminError" class="text-red-500 mt-4">{{ adminError }}</p>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { ref } from 'vue';

const authStore = useAuthStore();
const users = ref([]);
const adminError = ref('');

const fetchUsers = async () => {
  adminError.value = '';
  try {
    // Example: Create a server API endpoint for admin to fetch all users
    const response = await $fetch('/api/user', {
      headers: {
        Authorization: `Bearer ${useCookie('auth_token').value}` // Send token for server-side verification
      }
    });
    users.value = response.users;
  } catch (error) {
    adminError.value = error.statusMessage || 'Failed to fetch users.';
  }
};

// Apply both auth and admin middleware to this page
definePageMeta({
  middleware: ['auth', 'admin']
});
</script>