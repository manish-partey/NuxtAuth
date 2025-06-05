<template>
  <div class="flex items-center space-x-4">
    <template v-if="authStore.loggedIn">
      <span class="text-sm hidden sm:inline">Hi, {{ authStore.user?.name }}</span>
      <NuxtLink to="/dashboard" class="text-sm font-medium text-gray-700 hover:text-blue-600">Dashboard</NuxtLink>
      <NuxtLink v-if="authStore.isAdmin()" to="/admin" class="text-sm font-medium text-gray-700 hover:text-blue-600">
        Admin
      </NuxtLink>
      <button @click="handleLogout"
        class="text-sm font-medium bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded transition">
        Sign Out
      </button>
    </template>
    <template v-else>
      <NuxtLink to="/login" class="text-sm font-medium text-gray-700 hover:text-blue-600">Sign In</NuxtLink>
      <NuxtLink to="/register" class="text-sm font-medium text-gray-700 hover:text-blue-600">Sign Up</NuxtLink>
      <NuxtLink to="/organization-register" class="text-sm font-medium text-gray-700 hover:text-blue-600">
        Register Org
      </NuxtLink>
    </template>
  </div>
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
