<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold mb-6">Admin Dashboard</h1>
    <p v-if="authStore.user">
      Welcome, {{ authStore.user.name }} (Admin)!
    </p>
    <p v-else>Loading admin data...</p>

    <h2 class="text-xl font-bold mt-8 mb-4">Manage Users</h2>
    <div class="bg-white p-6 rounded shadow-md">
      <p>This is highly restricted content only for users with the 'admin' role.</p>
      <button @click="fetchUsers" class="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
        Fetch All Users
      </button>
      <div v-if="users.length">
        <h3 class="text-lg font-semibold mt-4">All Users:</h3>
        <ul class="list-disc ml-6">
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
import { ref, onMounted } from 'vue';
import { useCookie } from '#app';

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

// Ensure user state is loaded on page mount
onMounted(async () => {
  if (!authStore.user && !authStore.loading) {
    await authStore.fetchUser();
  }
});

// Apply both auth and admin middleware to this page
definePageMeta({
  middleware: ['auth', 'admin'],
});
</script>
