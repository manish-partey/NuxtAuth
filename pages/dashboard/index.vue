<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold mb-6">Dashboard</h1>
    <p v-if="authStore.user">
      Welcome, {{ authStore.user.name }} ({{ authStore.user.email }})!
      <br>
      Your role: {{ authStore.user.role }}
    </p>
    <p v-else>Loading user data...</p>

    <div v-if="authStore.isAdmin()" class="mt-6">
      <NuxtLink to="/admin/create-user" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
        + Create New User
      </NuxtLink>
    </div>

    <h2 class="text-xl font-bold mt-8 mb-4">Your Content</h2>
    <div class="bg-white p-6 rounded shadow-md">
      <p>This is protected content for authenticated users.</p>
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
