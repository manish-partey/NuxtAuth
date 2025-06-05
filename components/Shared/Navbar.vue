<template>
  <nav class="bg-blue-600 p-4 text-white flex justify-between items-center">
    <NuxtLink to="/" class="text-xl font-bold">Cargo Nuxt Auth App</NuxtLink>
    <div>
      <template v-if="authStore.loggedIn">
        <span class="mr-4">Welcome, {{ authStore.user?.name }}!</span>
        <NuxtLink to="/dashboard" class="mr-4 hover:underline">Dashboard</NuxtLink>
        <NuxtLink v-if="authStore.isAdmin()" to="/admin" class="mr-4 hover:underline">Admin</NuxtLink>
        <button @click="handleLogout" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Sign Out
        </button>
      </template>
      <template v-else>
        <NuxtLink to="/login" class="mr-4 hover:underline">Sign In</NuxtLink>
        <NuxtLink to="/register" class="mr-4 hover:underline">Sign Up</NuxtLink>
        <NuxtLink to="/organization-register" class="hover:underline">Register Org</NuxtLink>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>
