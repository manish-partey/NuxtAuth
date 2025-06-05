<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-50 px-4">
    <section class="bg-white p-10 rounded-xl shadow-lg w-full max-w-md" aria-labelledby="forgot-password-title">
      <h1 id="forgot-password-title" class="text-3xl font-extrabold text-gray-900 mb-8 text-center tracking-tight">
        Forgot Password
      </h1>

      <form @submit.prevent="handleForgotPassword" class="space-y-6">
        <div>
          <label for="email" class="block text-gray-700 text-sm font-semibold mb-2">
            Email
          </label>
          <input type="email" id="email" v-model="email" required autocomplete="email"
            class="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition" />
        </div>

        <button type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md py-3 shadow-md transition focus:outline-none focus:ring-4 focus:ring-blue-400">
          Send Reset Link
        </button>
      </form>

      <p v-if="message" :class="messageType === 'success' ? 'text-green-600' : 'text-red-600'"
        class="mt-6 text-center font-medium" role="alert">
        {{ message }}
      </p>

      <p class="mt-6 text-center text-gray-700">
        Remember your password?
        <NuxtLink to="/login" class="text-blue-600 hover:underline font-medium ml-1">
          Sign In
        </NuxtLink>
      </p>
    </section>
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
