<template>
  <div class="flex justify-center items-center h-screen">
    <div class="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
      <h1 class="text-2xl font-bold mb-6">Email Verification</h1>
      <p v-if="message" :class="messageType === 'success' ? 'text-green-500' : 'text-red-500'">{{ message }}</p>
      <NuxtLink v-if="messageType === 'success'" to="/login" class="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Go to Login</NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const message = ref('');
const messageType = ref('');

onMounted(async () => {
  const token = route.query.token;
  if (!token) {
    message.value = 'No verification token provided.';
    messageType.value = 'error';
    return;
  }

  try {
    const response = await $fetch('/api/auth/verify-email', {
      method: 'POST',
      body: { token },
    });
    message.value = response.message;
    messageType.value = 'success';
  } catch (error) {
    message.value = error.statusMessage || 'Email verification failed.';
    messageType.value = 'error';
  }
});
</script>