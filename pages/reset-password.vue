<template>
  <div class="flex justify-center items-center h-screen">
    <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold mb-6 text-center">Reset Password</h1>
      <form @submit.prevent="handleResetPassword">
        <div class="mb-4">
          <label for="newPassword" class="block text-gray-700 text-sm font-bold mb-2">New Password:</label>
          <input
            type="password"
            id="newPassword"
            v-model="newPassword"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div class="mb-6">
          <label for="confirmPassword" class="block text-gray-700 text-sm font-bold mb-2">Confirm New Password:</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <button
          type="submit"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
        >
          Reset Password
        </button>
      </form>
      <p v-if="message" :class="messageType === 'success' ? 'text-green-500' : 'text-red-500'" class="mt-4 text-center">{{ message }}</p>
      <p class="mt-4 text-center">
        <NuxtLink v-if="messageType === 'success'" to="/login" class="text-blue-500 hover:underline">Go to Login</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const newPassword = ref('');
const confirmPassword = ref('');
const message = ref('');
const messageType = ref('');
const token = ref('');

onMounted(() => {
  token.value = route.query.token;
  if (!token.value) {
    message.value = 'No reset token provided.';
    messageType.value = 'error';
  }
});

const handleResetPassword = async () => {
  message.value = '';
  if (newPassword.value !== confirmPassword.value) {
    message.value = 'Passwords do not match.';
    messageType.value = 'error';
    return;
  }
  if (!token.value) {
    message.value = 'Invalid or missing reset token.';
    messageType.value = 'error';
    return;
  }

  try {
    const response = await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: { token: token.value, newPassword: newPassword.value },
    });
    message.value = response.message;
    messageType.value = 'success';
  } catch (error) {
    message.value = error.statusMessage || 'Password reset failed.';
    messageType.value = 'error';
  }
};
</script>