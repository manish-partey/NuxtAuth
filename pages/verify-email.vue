<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50 px-4">
    <section class="bg-white p-10 rounded-xl shadow-lg max-w-md w-full text-center" aria-live="polite"
      aria-atomic="true">
      <h1 class="text-3xl font-extrabold text-gray-900 mb-8">
        Email Verification
      </h1>

      <p v-if="message" :class="messageType === 'success' ? 'text-green-600' : 'text-red-600'"
        class="text-lg font-medium" role="alert">
        {{ message }}
      </p>

      <NuxtLink v-if="messageType === 'success'" to="/login"
        class="mt-8 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md shadow-md transition focus:outline-none focus:ring-4 focus:ring-blue-400">
        Go to Login
      </NuxtLink>
    </section>
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
