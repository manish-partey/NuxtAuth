<template>
  <div class="max-w-4xl mx-auto py-10 px-4">
    <div class="mb-8">
      <h1 class="text-4xl font-semibold text-gray-800 mb-2">Dashboard</h1>
      <p v-if="authStore.user" class="text-gray-700">
        Welcome back, <span class="font-medium">{{ authStore.user.name }}</span>!
        <br />
        <span class="text-sm text-gray-600">Email: {{ authStore.user.email }}</span><br />
        <span class="text-sm text-gray-600">Role: {{ authStore.user.role }}</span>
      </p>
      <p v-else class="text-gray-500 italic">Loading user data...</p>
    </div>

    <div v-if="authStore.isAdmin()" class="mb-6">
      <NuxtLink to="/admin/create-user"
        class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition">
        + Create New User
      </NuxtLink>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-md">
      <h2 class="text-2xl font-semibold text-gray-800 mb-3">Your Content</h2>
      <p class="text-gray-700">This is protected content available only to authenticated users.</p>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

definePageMeta({
  middleware: ['auth']
});
</script>
