<template>
  <div class="flex justify-center items-center h-screen">
    <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold mb-6 text-center">Forgot Password</h1>
      <form @submit.prevent="handleForgotPassword">
        <div class="mb-4">
          <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Email:</label>
          <input
            type="email"
            id="email"
            v-model="email"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <button
          type="submit"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
        >
          Send Reset Link
        </button>
      </form>
      <p v-if="message" :class="messageType === 'success' ? 'text-green-500' : 'text-red-500'" class="mt-4 text-center">{{ message }}</p>
      <p class="mt-4 text-center">
        Remember your password? <NuxtLink to="/login" class="text-blue-500 hover:underline">Sign In</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const email = ref('');
const message = ref('');
const messageType = ref('');

const handleForgotPassword = async () => {
  message.value = '';
  try {
    const response = await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value },
    });
    message.value = response.message;
    messageType.value = 'success';
  } catch (error) {
    message.value = error.statusMessage || 'Failed to send reset link.';
    messageType.value = 'error';
  }
};
</script>